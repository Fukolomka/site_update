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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, price, isActive } = body;

    // Валидация
    if (!name || !image || !price || price <= 0) {
      return NextResponse.json({ 
        error: 'Name, image, and price are required. Price must be greater than 0.' 
      }, { status: 400 });
    }

    // Проверяем, не существует ли уже кейс с таким именем
    const existingCase = await prisma.case.findFirst({
      where: {
        name: name
      }
    });

    if (existingCase) {
      return NextResponse.json({ 
        error: 'A case with this name already exists' 
      }, { status: 400 });
    }

    // Создаем новый кейс
    const newCase = await prisma.case.create({
      data: {
        name,
        description: description || '',
        image,
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      data: newCase,
      message: 'Case created successfully'
    });
  } catch (error) {
    console.error('Create case API error:', error);
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}