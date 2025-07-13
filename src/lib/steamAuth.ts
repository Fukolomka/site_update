// Прямая авторизация через Steam OpenID без Next.js

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const STEAM_API_KEY = process.env.NEXT_PUBLIC_STEAM_API_KEY || 'your-steam-api-key';
const RETURN_URL = process.env.NEXT_PUBLIC_RETURN_URL || 'https://hitmanki.store/auth/callback';
const REALM = process.env.NEXT_PUBLIC_REALM || 'https://hitmanki.store';

export interface SteamUser {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

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
  
  // Проверяем, что это успешный ответ от Steam
  if (urlParams.get('openid.mode') !== 'id_res') {
    return null;
  }

  const identity = urlParams.get('openid.identity');
  if (!identity) {
    return null;
  }

  // Извлекаем Steam ID из identity URL
  const steamIdMatch = identity.match(/\/id\/(\d+)$/);
  if (!steamIdMatch) {
    return null;
  }

  const steamId = steamIdMatch[1];

  try {
    // Получаем профиль пользователя из Steam API
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile');
    }

    const data = await response.json();
    const players = data.response?.players;

    if (!players || players.length === 0) {
      throw new Error('Steam profile not found');
    }

    const user = players[0];
    
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