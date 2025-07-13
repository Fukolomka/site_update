import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    // Проверяем, существует ли кейс
    const existingCase = await prisma.case.findUnique({
      where: { id }
    });

    if (!existingCase) {
      return NextResponse.json({ 
        error: 'Case not found' 
      }, { status: 404 });
    }

    // Обновляем статус кейса
    const updatedCase = await prisma.case.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      data: updatedCase,
      message: `Case ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle case status API error:', error);
    return NextResponse.json({ error: 'Failed to toggle case status' }, { status: 500 });
  }
}