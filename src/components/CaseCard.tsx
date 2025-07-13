'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Case } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CaseCardProps {
  case: Case;
  onOpen?: (caseId: string) => void;
}

export function CaseCard({ case: caseData, onOpen }: CaseCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={caseData.image}
            alt={caseData.name}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{caseData.name}</CardTitle>
        {caseData.description && (
          <p className="text-sm text-gray-600 mb-3">{caseData.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(caseData.price)}
          </span>
          <Button
            onClick={() => onOpen?.(caseData.id)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Open Case
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}