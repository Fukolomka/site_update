import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic counts
    const [totalUsers, totalCases, totalItems] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.item.count()
    ]);

    // Get revenue data
    const caseOpens = await prisma.caseOpen.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        case: true
      }
    });

    const totalRevenue = caseOpens.reduce((sum: number, open: any) => sum + open.case.price, 0);

    // Calculate monthly revenue and growth
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [lastMonthOpens, thisMonthOpens] = await Promise.all([
      prisma.caseOpen.findMany({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        include: {
          case: true
        }
      }),
      prisma.caseOpen.findMany({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        },
        include: {
          case: true
        }
      })
    ]);

    const lastMonthRevenue = lastMonthOpens.reduce((sum: number, open: any) => sum + open.case.price, 0);
    const thisMonthRevenue = thisMonthOpens.reduce((sum: number, open: any) => sum + open.case.price, 0);
    const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Get top cases by opens
    const topCases = await prisma.case.findMany({
      take: 5,
      orderBy: {
        opens: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            opens: true
          }
        }
      }
    });

    // Get top items by drops
    const topItems = await prisma.item.findMany({
      take: 5,
      orderBy: {
        drops: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            drops: true
          }
        }
      }
    });

    // Get recent activity
    const recentActivity = await prisma.caseOpen.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        case: true,
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCases,
        totalItems,
        totalRevenue,
        monthlyRevenue: thisMonthRevenue,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        topCases: topCases.map((caseItem: any) => ({
          name: caseItem.name,
          opens: caseItem._count.opens,
          revenue: caseItem._count.opens * caseItem.price
        })),
        topItems: topItems.map((item: any) => ({
          name: item.name,
          drops: item._count.drops,
          value: item._count.drops * item.price
        })),
        recentActivity: recentActivity.map((open: any) => ({
          type: 'Case Open',
          description: `${open.user.name} opened ${open.case.name}`,
          timestamp: open.createdAt.toISOString(),
          value: open.case.price
        }))
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}