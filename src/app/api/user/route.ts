
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Not logged in'
      }, { status: 200 });
    }

    const payload = verifyToken(token);

    if (!payload || typeof payload === 'string' || !payload.userId) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Invalid token'
      }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        steamId: true,
        username: true,
        avatar: true,
        email: true,
        balance: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'User not found'
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({
      success: false,
      data: null,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
