import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { inviteCode } = await request.json();
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const db = await getDb();
    const group = await db.collection('groups').findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!group) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const isAlreadyMember = group.members.some(
      (m: { userId: string }) => m.userId === session.userId
    );

    if (isAlreadyMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    await db.collection('groups').updateOne(
      { _id: group._id },
      {
        $push: {
          members: {
            userId: session.userId,
            name: session.name,
            email: session.email,
            joinedAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({ success: true, groupId: group._id.toString() });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}
