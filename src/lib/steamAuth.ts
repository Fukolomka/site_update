// Прямая авторизация через Steam OpenID без Next.js

import { SteamUser } from '@/types';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const RETURN_URL = process.env.NEXT_PUBLIC_RETURN_URL || 'https://hitmanki.store/auth/callback';
const REALM = process.env.NEXT_PUBLIC_REALM || 'https://hitmanki.store';

/**
 * Инициирует авторизацию через Steam OpenID
 */
export function initiateSteamAuth(): void {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': RETURN_URL,
    'openid.realm': REALM,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  // Перенаправляем на Steam OpenID
  window.location.href = `${STEAM_OPENID_URL}?${params.toString()}`;
}

/**
 * Обрабатывает callback от Steam OpenID
 */
export async function handleSteamCallback(): Promise<SteamUser | null> {
  const urlParams = new URLSearchParams(window.location.search);
  
  console.log('Steam callback URL params:', Object.fromEntries(urlParams.entries()));
  
  // Проверяем, что это успешный ответ от Steam
  if (urlParams.get('openid.mode') !== 'id_res') {
    console.log('Invalid openid.mode:', urlParams.get('openid.mode'));
    return null;
  }

  const identity = urlParams.get('openid.identity');
  if (!identity) {
    console.log('No openid.identity found');
    return null;
  }

  console.log('Steam identity:', identity);

  // Извлекаем Steam ID из identity URL
  const steamIdMatch = identity.match(/\/id\/(\d+)$/);
  if (!steamIdMatch) {
    console.log('Could not extract Steam ID from identity');
    return null;
  }

  const steamId = steamIdMatch[1];
  console.log('Extracted Steam ID:', steamId);

  try {
    // Получаем профиль пользователя через наш API route
    const response = await fetch(`/api/steam/profile?steamid=${steamId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch Steam profile');
    }

    const user = data.data;
    
    // Сохраняем пользователя в localStorage
    localStorage.setItem('steamUser', JSON.stringify(user));
    
    // Создаем простой токен (можно заменить на JWT)
    const token = btoa(JSON.stringify({
      steamId: user.steamid,
      username: user.personaname,
      avatar: user.avatarfull,
      timestamp: Date.now(),
    }));
    
    localStorage.setItem('authToken', token);
    
    return user;
  } catch (error) {
    console.error('Error handling Steam callback:', error);
    return null;
  }
}

/**
 * Получает текущего пользователя из localStorage
 */
export function getCurrentUser(): SteamUser | null {
  try {
    const userStr = localStorage.getItem('steamUser');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    const token = localStorage.getItem('authToken');
    
    if (!token) return null;
    
    // Проверяем, что токен не истек (24 часа)
    const tokenData = JSON.parse(atob(token));
    const now = Date.now();
    const tokenAge = now - tokenData.timestamp;
    
    if (tokenAge > 24 * 60 * 60 * 1000) {
      // Токен истек, очищаем данные
      logout();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Выход из системы
 */
export function logout(): void {
  localStorage.removeItem('steamUser');
  localStorage.removeItem('authToken');
  window.location.href = '/';
}

/**
 * Проверяет, авторизован ли пользователь
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}