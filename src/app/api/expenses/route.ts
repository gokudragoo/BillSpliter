import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const expenses = await db.collection('expenses')
      .find({ groupId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
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
      description, 
      amount, 
      category, 
      splitBetween,
      receiptHash,
      receiptAnalysis 
    } = await request.json();

    if (!groupId || !description || !amount || !splitBetween?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const result = await db.collection('expenses').insertOne({
      groupId,
      description,
      amount: parseFloat(amount),
      category: category || 'Other',
      paidBy: session.userId,
      paidByName: session.name,
      splitBetween,
      receiptHash,
      receiptAnalysis,
      verified: receiptAnalysis?.isValid && !receiptAnalysis?.isFake,
      createdAt: new Date()
    });

    await db.collection('groups').updateOne(
      { _id: new ObjectId(groupId) },
      { $inc: { totalExpenses: parseFloat(amount) } }
    );

    return NextResponse.json({ 
      success: true, 
      expenseId: result.insertedId.toString() 
    });
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
