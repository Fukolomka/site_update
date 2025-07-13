import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cases = await prisma.case.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: cases.map((caseItem: any) => ({
        id: caseItem.id,
        name: caseItem.name,
        description: caseItem.description || '',
        image: caseItem.image,
        price: caseItem.price,
        isActive: caseItem.isActive,
        createdAt: caseItem.createdAt,
        updatedAt: caseItem.updatedAt,
        itemsCount: caseItem._count.items
      }))
    });
  } catch (error) {
    console.error('Cases API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}