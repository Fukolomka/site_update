import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        image: item.image,
        rarity: item.rarity,
        type: item.type,
        price: item.price,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    console.error('Items API error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}