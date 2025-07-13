import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { csgoMarketParser } from '@/lib/csgoMarketParser';

interface ParseSettings {
  maxItems: number;
  minPrice: number;
  maxPrice: number;
  rarityFilter: string[];
  typeFilter: string[];
  searchQuery: string;
}

interface MarketItem {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: string;
  type: string;
  price: number;
  marketPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings: ParseSettings = body;

    // Получаем существующие предметы для проверки дубликатов
    const existingItems = await prisma.item.findMany({
      select: {
        name: true,
        image: true
      }
    });

    const existingNames = new Set(existingItems.map((item: any) => item.name.toLowerCase()));
    const existingImages = new Set(existingItems.map((item: any) => item.image));

    // Парсим предметы с CS:GO Market
    const marketItems = await csgoMarketParser.getItems({
      maxItems: settings.maxItems,
      minPrice: settings.minPrice,
      maxPrice: settings.maxPrice,
      searchQuery: settings.searchQuery
    });

    // Обрабатываем полученные предметы
    const processedItems = marketItems.map((item: any) => {
      const isNew = !existingNames.has(item.name.toLowerCase()) && !existingImages.has(item.image);
      const isDuplicate = existingNames.has(item.name.toLowerCase()) || existingImages.has(item.image);
      
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        rarity: item.rarity,
        type: item.type,
        price: item.price,
        marketPrice: item.marketPrice,
        isNew,
        isDuplicate
      };
    });

    return NextResponse.json({
      success: true,
      data: processedItems,
      message: `Successfully parsed ${processedItems.length} items`
    });
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json({ error: 'Failed to parse items' }, { status: 500 });
  }
}

