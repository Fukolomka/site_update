import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Проверяем, существует ли кейс
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
            opens: true
          }
        }
      }
    });

    if (!existingCase) {
      return NextResponse.json({ 
        error: 'Case not found' 
      }, { status: 404 });
    }

    // Проверяем, есть ли связанные данные
    if (existingCase._count.items > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete case with items. Remove all items first.' 
      }, { status: 400 });
    }

    if (existingCase._count.opens > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete case with opening history. This case has been opened by users.' 
      }, { status: 400 });
    }

    // Удаляем кейс
    await prisma.case.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete case API error:', error);
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
  }
}