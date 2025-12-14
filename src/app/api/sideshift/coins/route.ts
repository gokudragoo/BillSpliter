import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://sideshift.ai/api/v2/coins');
    if (!response.ok) {
      throw new Error('Failed to fetch coins');
    }
    
    const coins = await response.json();
    
    const popularCoins = [
      { coin: 'BTC', name: 'Bitcoin', network: 'bitcoin' },
      { coin: 'ETH', name: 'Ethereum', network: 'ethereum' },
      { coin: 'USDT', name: 'Tether', network: 'ethereum' },
      { coin: 'USDT', name: 'Tether (TRC20)', network: 'tron' },
      { coin: 'BNB', name: 'BNB', network: 'bsc' },
      { coin: 'SOL', name: 'Solana', network: 'solana' },
      { coin: 'MATIC', name: 'Polygon', network: 'polygon' },
      { coin: 'XRP', name: 'Ripple', network: 'ripple' },
      { coin: 'DOGE', name: 'Dogecoin', network: 'dogecoin' },
      { coin: 'LTC', name: 'Litecoin', network: 'litecoin' }
    ];

    return NextResponse.json({ 
      allCoins: coins,
      popularCoins 
    });
  } catch (error) {
    console.error('Coins fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }
}
