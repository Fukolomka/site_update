import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Generates a JWT token for user authentication
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      steamId: user.steamId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Steam OpenID configuration
 */
export const STEAM_OPENID_CONFIG = {
  provider: 'https://steamcommunity.com/openid',
  returnTo: process.env.STEAM_RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
  realm: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

/**
 * Validates Steam OpenID response
 */
export function validateSteamOpenId(params: URLSearchParams): boolean {
  const mode = params.get('openid.mode');
  const identity = params.get('openid.identity');

  if (mode !== 'id_res' || !identity) {
    return false;
  }

  // Extract Steam ID from identity URL
  const steamIdMatch = identity.match(/\/id\/(\d+)$/);
  if (!steamIdMatch) {
    return false;
  }

  return true;
}

/**
 * Extracts Steam ID from OpenID identity URL
 */
export function extractSteamId(identity: string): string | null {
  const match = identity.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Checks if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN';
}

/**
 * Checks if user is moderator or admin
 */
export function isModerator(user: User): boolean {
  return user.role === 'MODERATOR' || user.role === 'ADMIN';
}

/**
 * Gets Steam profile from Steam API
 */
export async function getSteamProfile(steamId: string): Promise<any> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new Error('Steam API key not configured');
  }

  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Steam profile');
  }

  const data = await response.json();
  const players = data.response?.players;

  if (!players || players.length === 0) {
    throw new Error('Steam profile not found');
  }

  return players[0];
}