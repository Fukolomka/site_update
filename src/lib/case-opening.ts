import { Item, CaseItem } from '@/types';

/**
 * Generates a random item from a case based on drop rates
 */
export function generateRandomItem(caseItems: CaseItem[]): Item {
  // Calculate total weight
  const totalWeight = caseItems.reduce((sum, item) => sum + item.dropRate, 0);
  
  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight;
  
  // Find the winning item
  let currentWeight = 0;
  for (const caseItem of caseItems) {
    currentWeight += caseItem.dropRate;
    if (random <= currentWeight) {
      return caseItem.item;
    }
  }
  
  // Fallback to first item (shouldn't happen)
  return caseItems[0].item;
}

/**
 * Generates items for case opening animation
 */
export function generateAnimationItems(caseItems: CaseItem[], winningItem: Item): {
  items: Item[];
  winningIndex: number;
} {
  const items: Item[] = [];
  const totalItems = 50; // Number of items to show in animation
  const winningIndex = Math.floor(totalItems / 2) + Math.floor(Math.random() * 5) - 2; // Random position around middle
  
  // Generate random items for animation
  for (let i = 0; i < totalItems; i++) {
    if (i === winningIndex) {
      items.push(winningItem);
    } else {
      const randomCaseItem = caseItems[Math.floor(Math.random() * caseItems.length)];
      items.push(randomCaseItem.item);
    }
  }
  
  return { items, winningIndex };
}

/**
 * Calculates the rarity color for UI display
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'COMMON':
      return 'bg-gray-400';
    case 'UNCOMMON':
      return 'bg-green-400';
    case 'RARE':
      return 'bg-blue-400';
    case 'EPIC':
      return 'bg-purple-400';
    case 'LEGENDARY':
      return 'bg-yellow-400';
    case 'MYTHICAL':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Calculates the rarity glow effect for UI
 */
export function getRarityGlow(rarity: string): string {
  switch (rarity) {
    case 'COMMON':
      return 'shadow-gray-400/50';
    case 'UNCOMMON':
      return 'shadow-green-400/50';
    case 'RARE':
      return 'shadow-blue-400/50';
    case 'EPIC':
      return 'shadow-purple-400/50';
    case 'LEGENDARY':
      return 'shadow-yellow-400/50';
    case 'MYTHICAL':
      return 'shadow-red-400/50';
    default:
      return 'shadow-gray-400/50';
  }
}