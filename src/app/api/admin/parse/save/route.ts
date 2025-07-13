import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ParsedItem {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: string;
  type: string;
  price: number;
  marketPrice: number;
  isNew: boolean;
  isDuplicate: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items }: { items: ParsedItem[] } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ 
        error: 'Invalid items data' 
      }, { status: 400 });
    }

    let savedCount = 0;
    let skippedCount = 0;

    // Сохраняем каждый предмет
    for (const item of items) {
      try {
        // Проверяем, не существует ли уже предмет с таким именем
        const existingItem = await prisma.item.findFirst({
          where: {
            name: item.name
          }
        });

        if (existingItem) {
          skippedCount++;
          continue;
        }

        // Преобразуем редкость в формат базы данных
        const rarity = convertRarity(item.rarity);
        const type = convertType(item.type);

        // Создаем новый предмет
        await prisma.item.create({
          data: {
            name: item.name,
            description: item.description,
            image: item.image,
            rarity,
            type,
            price: item.price,
            isActive: true
          }
        });

        savedCount++;
      } catch (error) {
        console.error(`Error saving item ${item.name}:`, error);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      savedCount,
      skippedCount,
      message: `Successfully saved ${savedCount} items, skipped ${skippedCount} duplicates`
    });
  } catch (error) {
    console.error('Save parsed items API error:', error);
    return NextResponse.json({ error: 'Failed to save items' }, { status: 500 });
  }
}

// Функция для преобразования редкости CS:GO в формат базы данных
function convertRarity(csgoRarity: string): string {
  switch (csgoRarity.toLowerCase()) {
    case 'consumer grade':
      return 'COMMON';
    case 'industrial grade':
      return 'UNCOMMON';
    case 'mil-spec grade':
      return 'RARE';
    case 'restricted':
      return 'EPIC';
    case 'classified':
      return 'LEGENDARY';
    case 'covert':
      return 'MYTHICAL';
    default:
      return 'COMMON';
  }
}

// Функция для преобразования типа CS:GO в формат базы данных
function convertType(csgoType: string): string {
  switch (csgoType.toLowerCase()) {
    case 'weapon':
      return 'WEAPON';
    case 'knife':
      return 'KNIFE';
    case 'gloves':
      return 'GLOVES';
    case 'sticker':
      return 'STICKER';
    case 'case':
      return 'CASE';
    case 'key':
      return 'KEY';
    default:
      return 'WEAPON';
  }
}