import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

interface Balance {
  [userId: string]: number;
}

interface Settlement {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amount: number;
}

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

    const expenses = await db.collection('expenses').find({ groupId: id }).toArray();
    const settlements = await db.collection('settlements').find({ 
      groupId: id, 
      status: 'completed' 
    }).toArray();

    const balances: Balance = {};
    const memberMap: { [key: string]: string } = {};
    
    group.members.forEach((m: { userId: string; name: string }) => {
      balances[m.userId] = 0;
      memberMap[m.userId] = m.name;
    });

    expenses.forEach((expense: { paidBy: string; amount: number; splitBetween: string[] }) => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach((userId: string) => {
        balances[userId] -= splitAmount;
      });
    });

    settlements.forEach((s: { fromUserId: string; toUserId: string; amount: number }) => {
      balances[s.fromUserId] += s.amount;
      balances[s.toUserId] -= s.amount;
    });

    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance < -0.01) {
        debtors.push({ userId, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        creditors.push({ userId, amount: balance });
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const suggestedSettlements: Settlement[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        suggestedSettlements.push({
          from: { userId: debtor.userId, name: memberMap[debtor.userId] },
          to: { userId: creditor.userId, name: memberMap[creditor.userId] },
          amount: Math.round(amount * 100) / 100
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return NextResponse.json({
      balances: Object.entries(balances).map(([userId, balance]) => ({
        userId,
        name: memberMap[userId],
        balance: Math.round(balance * 100) / 100
      })),
      suggestedSettlements
    });
  } catch (error) {
    console.error('Balance calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate balances' }, { status: 500 });
  }
}
