import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // В реальном приложении настройки могут храниться в базе данных
    // Пока возвращаем дефолтные настройки
    const settings = {
      siteName: 'HitmanKi Store',
      siteDescription: 'Premium CS2 case opening platform',
      maintenanceMode: false,
      registrationEnabled: true,
      steamApiKey: process.env.STEAM_API_KEY || '',
      defaultCurrency: 'USD',
      maxCaseOpensPerDay: 100,
      adminEmails: [],
      notificationSettings: {
        emailNotifications: false,
        discordWebhook: '',
        telegramBot: ''
      }
    };

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // В реальном приложении здесь будет сохранение в базу данных
    // Пока просто возвращаем успех
    console.log('Saving settings:', body);

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}