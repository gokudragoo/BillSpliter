"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { 
  Users, 
  Receipt,
  ArrowLeft,
  Loader2,
  Copy,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  CreditCard
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  userId: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  currency: string;
  members: Member[];
  totalExpenses: number;
  inviteCode: string;
  creatorId: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  paidByName: string;
  createdAt: string;
  verified: boolean;
}

interface Balance {
  userId: string;
  name: string;
  balance: number;
}

interface Settlement {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amount: number;
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        fetch(`/api/groups/${id}`),
        fetch(`/api/expenses?groupId=${id}`),
        fetch(`/api/groups/${id}/balances`)
      ]);

      if (groupRes.status === 401) {
        router.push("/login");
        return;
      }

      if (groupRes.ok) {
        setGroup(await groupRes.json());
      }
      if (expensesRes.ok) {
        setExpenses(await expensesRes.json());
      }
      if (balancesRes.ok) {
        const data = await balancesRes.json();
        setBalances(data.balances || []);
        setSettlements(data.suggestedSettlements || []);
      }
    } catch {
      toast.error("Failed to load group");
    } finally {
      setLoading(false);
    }
  }

  async function deleteGroup() {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Group deleted");
        router.push("/groups");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting group");
    }
  }

  function copyInviteCode() {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      toast.success("Invite code copied!");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-sky-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Group not found</p>
          <Link href="/groups">
            <Button className="mt-4 bg-sky-500">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
            {group.description && <p className="text-slate-600">{group.description}</p>}
          </div>
          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-sky-200">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Group</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <QRCodeSVG 
                  value={`BILLSPLITR:${group.inviteCode}`} 
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0ea5e9"
                />
                <p className="mt-4 text-2xl font-mono font-bold text-sky-600">{group.inviteCode}</p>
                <p className="text-sm text-slate-500 mt-2">Scan or enter code to join</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={copyInviteCode} className="border-sky-200">
            <Copy className="w-4 h-4 mr-2" />
            {group.inviteCode}
          </Button>
          <Button variant="destructive" size="icon" onClick={deleteGroup}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-sky-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses</CardTitle>
                <Link href={`/expenses?groupId=${id}`}>
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Expense
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-sky-200 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No expenses yet</p>
                    <Link href={`/expenses?groupId=${id}`}>
                      <Button className="bg-sky-500 hover:bg-sky-600">Add First Expense</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between p-4 rounded-xl bg-sky-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            expense.verified ? "bg-green-500" : "bg-sky-500"
                          }`}>
                            <Receipt className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{expense.description}</p>
                            <p className="text-sm text-slate-500">
                              Paid by {expense.paidByName} • {expense.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {group.currency} {expense.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle>Suggested Settlements</CardTitle>
              </CardHeader>
              <CardContent>
                {settlements.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">All settled up!</p>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-100">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-900">{s.from.name}</span>
                          <ArrowUpRight className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-slate-900">{s.to.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-orange-600">
                            {group.currency} {s.amount.toLocaleString()}
                          </span>
                          <Link href={`/settle?groupId=${id}&to=${s.to.userId}&amount=${s.amount}`}>
                            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle className="text-lg">Members ({group.members.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle className="text-lg">Balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {balances.map((b) => (
                  <div key={b.userId} className="flex items-center justify-between">
                    <span className="text-slate-700">{b.name}</span>
                    <span className={`font-bold ${
                      b.balance > 0 ? "text-green-600" : b.balance < 0 ? "text-red-600" : "text-slate-500"
                    }`}>
                      {b.balance > 0 && <ArrowDownLeft className="w-4 h-4 inline mr-1" />}
                      {b.balance < 0 && <ArrowUpRight className="w-4 h-4 inline mr-1" />}
                      {group.currency} {Math.abs(b.balance).toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-sky-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Total Expenses</p>
                  <p className="text-3xl font-bold text-sky-600">
                    {group.currency} {(group.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
