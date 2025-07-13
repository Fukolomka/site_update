import { NextRequest, NextResponse } from 'next/server';
import { STEAM_OPENID_CONFIG } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': STEAM_OPENID_CONFIG.returnTo,
      'openid.realm': STEAM_OPENID_CONFIG.realm,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    const steamUrl = `${STEAM_OPENID_CONFIG.provider}/login?${params.toString()}`;
    
    return NextResponse.redirect(steamUrl);
  } catch (error) {
    console.error('Steam auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}