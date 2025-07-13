// User types
export interface User {
  id: string;
  steamId: string;
  username: string;
  avatar?: string;
  email?: string;
  balance: number;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

// Case types
export interface Case {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: CaseItem[];
}

export interface CaseItem {
  id: string;
  caseId: string;
  itemId: string;
  dropRate: number;
  case: Case;
  item: Item;
}

// Item types
export interface Item {
  id: string;
  name: string;
  description?: string;
  image: string;
  rarity: ItemRarity;
  type: ItemType;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHICAL = 'MYTHICAL'
}

export enum ItemType {
  WEAPON = 'WEAPON',
  KNIFE = 'KNIFE',
  GLOVES = 'GLOVES',
  STICKER = 'STICKER',
  CASE = 'CASE',
  KEY = 'KEY'
}

// Inventory types
export interface UserInventory {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  item: Item;
}

export enum InventoryStatus {
  OWNED = 'OWNED',
  LISTED_FOR_SALE = 'LISTED_FOR_SALE',
  PENDING_WITHDRAWAL = 'PENDING_WITHDRAWAL',
  WITHDRAWN = 'WITHDRAWN'
}

// Case opening types
export interface CaseOpening {
  id: string;
  userId: string;
  caseId: string;
  itemId: string;
  cost: number;
  createdAt: Date;
  user: User;
  case: Case;
  item: Item;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  paymentMethod?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  CASE_OPENING = 'CASE_OPENING',
  ITEM_SALE = 'ITEM_SALE',
  REFUND = 'REFUND'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Withdrawal types
export interface Withdrawal {
  id: string;
  userId: string;
  itemId?: string;
  amount?: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  tradeUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export enum WithdrawalMethod {
  STEAM_TRADE = 'STEAM_TRADE',
  SELL_BACK = 'SELL_BACK',
  CASH_OUT = 'CASH_OUT'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Case opening animation types
export interface CaseOpeningResult {
  item: Item;
  animationData: {
    winningIndex: number;
    items: Item[];
    duration: number;
  };
}

// Settings types
export interface Settings {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Steam OpenID types
export interface SteamProfile {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  personastate: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

// Component prop types
export interface CaseCardProps {
  case: Case;
  onOpen?: (caseId: string) => void;
}

export interface ItemCardProps {
  item: Item;
  showPrice?: boolean;
  onClick?: (item: Item) => void;
}

export interface UserStatsProps {
  user: User;
  stats: {
    totalOpenings: number;
    totalSpent: number;
    bestItem: Item | null;
    totalItems: number;
  };
}

// Socket.io types
export interface SocketEvents {
  caseOpening: CaseOpening;
  userJoined: { userId: string; username: string };
  userLeft: { userId: string };
  liveStats: {
    onlineUsers: number;
    recentOpenings: CaseOpening[];
  };
}