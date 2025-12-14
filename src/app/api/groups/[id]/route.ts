import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    const group = await db.collection('groups').findOne({ _id: new ObjectId(id) });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isMember = group.creatorId === session.userId || 
      group.members.some((m: { userId: string }) => m.userId === session.userId);
    
    if (!isMember) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Group fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    const group = await db.collection('groups').findOne({ _id: new ObjectId(id) });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.creatorId !== session.userId) {
      return NextResponse.json({ error: 'Only creator can delete' }, { status: 403 });
    }

    await db.collection('groups').deleteOne({ _id: new ObjectId(id) });
    await db.collection('expenses').deleteMany({ groupId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Group delete error:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
