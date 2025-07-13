'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getRarityColor, getRarityGlow } from '@/lib/case-opening';

interface ItemCardProps {
  item: Item;
  showPrice?: boolean;
  onClick?: (item: Item) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ItemCard({ item, showPrice = true, onClick, size = 'md' }: ItemCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${getRarityGlow(item.rarity)}`}
      onClick={() => onClick?.(item)}
    >
      <CardContent className="p-2">
        <div className={`relative ${sizeClasses[size]} mx-auto mb-2`}>
          <div className={`absolute inset-0 ${getRarityColor(item.rarity)} opacity-20 rounded`} />
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-1"
          />
        </div>
        <h3 className="text-xs font-medium text-center truncate">{item.name}</h3>
        {showPrice && (
          <p className="text-xs text-center mt-1 font-semibold text-primary">
            {formatCurrency(item.price)}
          </p>
        )}
        <div className={`w-full h-1 ${getRarityColor(item.rarity)} rounded-full mt-2`} />
      </CardContent>
    </Card>
  );
}