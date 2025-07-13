import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamid');
    
    if (!steamId) {
      return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
    }

    // Получаем список админов из переменной окружения
    const adminSteamIds = process.env.ADMIN_STEAM_IDS?.split(',') || [];
    
    // Проверяем, является ли пользователь админом
    const isAdmin = adminSteamIds.includes(steamId);

    // Если пользователь админ, проверяем/создаем запись в базе данных
    if (isAdmin) {
      await prisma.user.upsert({
        where: { steamId },
        update: {
          role: 'ADMIN',
        },
        create: {
          steamId,
          username: 'Admin', // Будет обновлено при первом входе
          avatar: '',
          role: 'ADMIN',
        },
      });
    }

    return NextResponse.json({
      success: true,
      isAdmin,
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 });
  }
}