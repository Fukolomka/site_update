import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateRandomItem, generateAnimationItems } from '@/lib/case-opening';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get case with items
    const caseData = await prisma.case.findUnique({
      where: { id: params.id, isActive: true },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check if user has enough balance
    if (user.balance < caseData.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Generate random item
    const wonItem = generateRandomItem(caseData.items);
    
    // Generate animation items
    const animationData = generateAnimationItems(caseData.items, wonItem);

    // Create database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: caseData.price } },
      });

      // Record case opening
      const caseOpening = await tx.caseOpening.create({
        data: {
          userId: user.id,
          caseId: caseData.id,
          itemId: wonItem.id,
          cost: caseData.price,
        },
      });

      // Add item to inventory
      const existingInventory = await tx.userInventory.findFirst({
        where: {
          userId: user.id,
          itemId: wonItem.id,
          status: 'OWNED',
        },
      });

      if (existingInventory) {
        await tx.userInventory.update({
          where: { id: existingInventory.id },
          data: { quantity: { increment: 1 } },
        });
      } else {
        await tx.userInventory.create({
          data: {
            userId: user.id,
            itemId: wonItem.id,
            quantity: 1,
            status: 'OWNED',
          },
        });
      }

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'CASE_OPENING',
          amount: -caseData.price,
          status: 'COMPLETED',
          description: `Opened ${caseData.name} case`,
        },
      });

      return caseOpening;
    });

    return NextResponse.json({
      success: true,
      data: {
        item: wonItem,
        animationData,
        caseOpening: result,
      },
    });
  } catch (error) {
    console.error('Case opening error:', error);
    return NextResponse.json({ error: 'Failed to open case' }, { status: 500 });
  }
}