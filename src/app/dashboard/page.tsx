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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-sky-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Groups</p>
                  <p className="text-3xl font-bold text-slate-900">{groups.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Users className="w-7 h-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Tracked</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Receipt className="w-7 h-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Credit Score</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">{user?.creditScore || 100}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-7 h-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Wallet</p>
                  <p className="text-lg font-semibold text-slate-900 truncate max-w-[120px]">
                    {user?.walletAddress 
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : "Not linked"
                    }
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Wallet className="w-7 h-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-sky-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-bold">Your Groups</CardTitle>
                <Link href="/groups">
                  <Button size="sm" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Group
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-sky-400" />
                    </div>
                    <p className="text-slate-600 mb-2 font-medium">No groups yet</p>
                    <p className="text-sm text-slate-500 mb-6">Create your first group to get started</p>
                    <Link href="/groups">
                      <Button className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg">
                        Create Your First Group
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.slice(0, 5).map((group) => (
                      <Link key={group._id} href={`/groups/${group._id}`}>
                        <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-sky-50 to-white border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 mb-1">{group.name}</p>
                              <p className="text-sm text-slate-500">
                                {group.members?.length || 0} members
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="font-bold text-slate-900">
                                {group.currency} {(group.totalExpenses || 0).toLocaleString()}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-sky-500" />
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
            <Card className="border-sky-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/groups" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2 text-sky-500" />
                    Create Group
                  </Button>
                </Link>
                <Link href="/expenses" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all duration-200">
                    <Receipt className="w-4 h-4 mr-2 text-sky-500" />
                    Add Expense
                  </Button>
                </Link>
                <Link href="/settle" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all duration-200">
                    <CreditCard className="w-4 h-4 mr-2 text-sky-500" />
                    Settle Payments
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all duration-200">
                    <Wallet className="w-4 h-4 mr-2 text-sky-500" />
                    Link Wallet
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              <CardContent className="pt-6 relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5">
                  <CreditCard className="w-8 h-8 opacity-95" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pay with Any Crypto</h3>
                <p className="text-sky-100 text-sm mb-6 leading-relaxed">
                  Use Bitcoin, Ethereum, or any supported crypto. SideShift converts it automatically.
                </p>
                <Link href="/settle">
                  <Button className="bg-white text-sky-600 hover:bg-sky-50 w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
