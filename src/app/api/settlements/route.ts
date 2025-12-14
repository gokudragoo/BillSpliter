import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const db = await getDb();
    const query = groupId 
      ? { groupId, $or: [{ fromUserId: session.userId }, { toUserId: session.userId }] }
      : { $or: [{ fromUserId: session.userId }, { toUserId: session.userId }] };

    const settlements = await db.collection('settlements')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Settlements fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { 
      groupId, 
      toUserId, 
      toUserName,
      amount,
      paymentMethod,
      shiftId,
      txHash
    } = await request.json();

    if (!groupId || !toUserId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('settlements').insertOne({
      groupId,
      fromUserId: session.userId,
      fromUserName: session.name,
      toUserId,
      toUserName,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'direct',
      shiftId,
      txHash,
      status: txHash ? 'completed' : 'pending',
      createdAt: new Date()
    });

    if (txHash) {
      await db.collection('users').updateOne(
        { email: session.email },
        { $inc: { creditScore: 5 } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      settlementId: result.insertedId.toString() 
    });
  } catch (error) {
    console.error('Settlement creation error:', error);
    return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 });
  }
}
