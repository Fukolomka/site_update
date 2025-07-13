import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Получаем статистику из базы данных
    const [
      totalUsers,
      totalCases,
      totalOpenings,
      totalRevenue,
      recentOpenings
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.user.count(),
      
      // Общее количество кейсов
      prisma.case.count({
        where: { isActive: true }
      }),
      
      // Общее количество открытий
      prisma.caseOpening.count(),
      
      // Общий доход (сумма всех открытий)
      prisma.caseOpening.aggregate({
        _sum: {
          cost: true
        }
      }),
      
      // Последние открытия
      prisma.caseOpening.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: true,
          case: true,
          item: true
        }
      })
    ]);

    // Подсчитываем активных пользователей (за последние 24 часа)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCases,
        totalOpenings,
        totalRevenue: totalRevenue._sum.cost || 0,
        activeUsers,
        recentOpenings: recentOpenings.map((opening: any) => ({
          user: {
            username: opening.user.username,
            avatar: opening.user.avatar
          },
          case: {
            name: opening.case.name
          },
          item: {
            name: opening.item.name,
            rarity: opening.item.rarity
          },
          createdAt: opening.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}