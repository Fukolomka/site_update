import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  validateSteamOpenId,
  extractSteamId,
  getSteamProfile,
  generateToken
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();

    // Copy all query parameters
    for (const [key, value] of searchParams) {
      params.set(key, value);
    }

    // Validate OpenID response
    if (!validateSteamOpenId(params)) {
      return NextResponse.redirect(new URL('/?error=invalid_auth', request.url));
    }

    const identity = params.get('openid.identity');
    const steamId = extractSteamId(identity!);
    if (!steamId) {
      return NextResponse.redirect(new URL('/?error=invalid_steam_id', request.url));
    }

    // Fetch profile from Steam
    const steamProfile = await getSteamProfile(steamId);

    // Create or update user
    let user = await prisma.user.upsert({
      where: { steamId },
      update: {
        username: steamProfile.personaname,
        avatar: steamProfile.avatarfull,
      },
      create: {
        steamId,
        username: steamProfile.personaname,
        avatar: steamProfile.avatarfull,
        role: (process.env.ADMIN_STEAM_IDS?.split(',') || []).includes(steamId)
          ? 'ADMIN'
          : 'USER',
      },
    });

    // Generate JWT
    const token = generateToken(user);

    // Set cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true для HTTPS в продакшене
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.hitmanki.store' : undefined, // домен для продакшена
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Steam Return Error]', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
