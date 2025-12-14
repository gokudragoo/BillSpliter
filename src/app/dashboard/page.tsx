"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Receipt, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Wallet,
  CreditCard,
  Loader2
} from "lucide-react";

interface Group {
  _id: string;
  name: string;
  members: { userId: string; name: string }[];
  totalExpenses: number;
  currency: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  creditScore: number;
  walletAddress?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        const groupsRes = await fetch("/api/groups");
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

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

  const totalExpenses = groups.reduce((sum, g) => sum + (g.totalExpenses || 0), 0);

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-600 mt-1">Here&apos;s your expense overview</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Groups</p>
                  <p className="text-3xl font-bold text-slate-900">{groups.length}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Tracked</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Credit Score</p>
                  <p className="text-3xl font-bold text-sky-600">{user?.creditScore || 100}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Wallet</p>
                  <p className="text-lg font-medium text-slate-900 truncate max-w-[120px]">
                    {user?.walletAddress 
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : "Not linked"
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-sky-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Groups</CardTitle>
                <Link href="/groups">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                    <Plus className="w-4 h-4 mr-1" />
                    New Group
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-sky-200 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No groups yet</p>
                    <Link href="/groups">
                      <Button className="bg-sky-500 hover:bg-sky-600">
                        Create Your First Group
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.slice(0, 5).map((group) => (
                      <Link key={group._id} href={`/groups/${group._id}`}>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{group.name}</p>
                              <p className="text-sm text-slate-500">
                                {group.members?.length || 0} members
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {group.currency} {(group.totalExpenses || 0).toLocaleString()}
                            </p>
                            <ArrowRight className="w-4 h-4 text-sky-500 ml-auto" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/groups" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50">
                    <Plus className="w-4 h-4 mr-2 text-sky-500" />
                    Create Group
                  </Button>
                </Link>
                <Link href="/expenses" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50">
                    <Receipt className="w-4 h-4 mr-2 text-sky-500" />
                    Add Expense
                  </Button>
                </Link>
                <Link href="/settle" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50">
                    <CreditCard className="w-4 h-4 mr-2 text-sky-500" />
                    Settle Payments
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50">
                    <Wallet className="w-4 h-4 mr-2 text-sky-500" />
                    Link Wallet
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-gradient-to-br from-sky-500 to-sky-600 text-white">
              <CardContent className="pt-6">
                <CreditCard className="w-10 h-10 mb-4 opacity-90" />
                <h3 className="text-lg font-semibold mb-2">Pay with Any Crypto</h3>
                <p className="text-sky-100 text-sm mb-4">
                  Use Bitcoin, Ethereum, or any supported crypto. SideShift converts it automatically.
                </p>
                <Link href="/settle">
                  <Button className="bg-white text-sky-600 hover:bg-sky-50 w-full">
                    Settle Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
