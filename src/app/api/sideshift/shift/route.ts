import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createVariableShift, getShiftStatus } from '@/lib/sideshift';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { 
      settleAddress, 
      depositCoin, 
      settleCoin = 'USDC',
      depositNetwork,
      settleNetwork = 'polygon',
      refundAddress
    } = await request.json();

    if (!settleAddress || !depositCoin || !depositNetwork) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shift = await createVariableShift(
      settleAddress,
      depositCoin,
      settleCoin,
      depositNetwork,
      settleNetwork,
      refundAddress
    );

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Shift creation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create shift' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get('shiftId');

    if (!shiftId) {
      return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
    }

    const status = await getShiftStatus(shiftId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Shift status error:', error);
    return NextResponse.json({ error: 'Failed to get shift status' }, { status: 500 });
  }
}
