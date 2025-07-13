import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No token found'
      });
    }

    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string') {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid token'
      });
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        steamId: true,
        username: true,
        avatar: true,
        role: true,
        balance: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'User not found or inactive'
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: user
    });

  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}