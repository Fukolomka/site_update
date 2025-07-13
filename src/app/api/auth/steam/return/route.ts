import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  validateSteamOpenId,
  extractSteamId,
  getSteamProfile,
  generateToken
} from '@/lib/auth';
import { UserRole } from '@/types';

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
      console.error('[Steam Return] Invalid OpenID response:', Object.fromEntries(params));
      return NextResponse.redirect(new URL('/?error=invalid_auth', request.url));
    }

    const identity = params.get('openid.identity');
    const steamId = extractSteamId(identity!);
    if (!steamId) {
      console.error('[Steam Return] Could not extract Steam ID from:', identity);
      return NextResponse.redirect(new URL('/?error=invalid_steam_id', request.url));
    }

    // Fetch profile from Steam
    let steamProfile;
    try {
      steamProfile = await getSteamProfile(steamId);
    } catch (error) {
      console.error('[Steam Return] Failed to fetch Steam profile:', error);
      return NextResponse.redirect(new URL('/?error=steam_api_error', request.url));
    }

    // Check if user is admin based on Steam ID
    // For now, we'll use a simple check - you can configure this via environment variables later
    const isAdmin = false; // Set to true for specific Steam IDs if needed

    // Create or update user
    let user;
    try {
      user = await prisma.user.upsert({
        where: { steamId },
        update: {
          username: steamProfile.personaname,
          avatar: steamProfile.avatarfull,
          role: isAdmin ? 'ADMIN' : undefined, // Update role if user is admin
        },
        create: {
          steamId,
          username: steamProfile.personaname,
          avatar: steamProfile.avatarfull,
          role: isAdmin ? 'ADMIN' : 'USER',
        },
      });
    } catch (error) {
      console.error('[Steam Return] Database error:', error);
      return NextResponse.redirect(new URL('/?error=database_error', request.url));
    }

    // Generate JWT
    const safeUser = { ...user, avatar: user.avatar ?? undefined, email: user.email ?? undefined, role: user.role as UserRole };
    const token = generateToken(safeUser);

    // Set cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Steam Return Error]', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
