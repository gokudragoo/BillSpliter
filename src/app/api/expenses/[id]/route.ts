import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
    
    const expense = await db.collection('expenses').findOne({ _id: new ObjectId(id) });
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.paidBy !== session.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.collection('expenses').deleteOne({ _id: new ObjectId(id) });
    
    await db.collection('groups').updateOne(
      { _id: new ObjectId(expense.groupId) },
      { $inc: { totalExpenses: -expense.amount } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Expense delete error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
