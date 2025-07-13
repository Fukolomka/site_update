import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamid');
    
    if (!steamId) {
      return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
    }

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Steam API key not configured' }, { status: 500 });
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
      return NextResponse.json({ error: 'Steam profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: players[0]
    });
  } catch (error) {
    console.error('Steam profile API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Steam profile' }, { status: 500 });
  }
}