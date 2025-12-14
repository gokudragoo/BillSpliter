import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    const groups = await db.collection('groups').find({
      $or: [
        { creatorId: session.userId },
        { 'members.userId': session.userId }
      ]
    }).toArray();

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, currency, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const db = await getDb();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const result = await db.collection('groups').insertOne({
      name,
      description: description || '',
      currency: currency || 'INR',
      creatorId: session.userId,
      inviteCode,
      members: [{
        userId: session.userId,
        name: session.name,
        email: session.email,
        joinedAt: new Date()
      }],
      createdAt: new Date(),
      totalExpenses: 0
    });

    return NextResponse.json({ 
      success: true, 
      groupId: result.insertedId.toString(),
      inviteCode 
    });
  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
