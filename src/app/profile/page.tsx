"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  User,
  Wallet,
  Mail,
  TrendingUp,
  Loader2,
  Save,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  creditScore: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.walletAddress) {
          setWalletAddress(data.walletAddress);
        }
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveWallet() {
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Invalid wallet address");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      });

      if (res.ok) {
        toast.success("Wallet linked successfully!");
        setUser(prev => prev ? { ...prev, walletAddress } : null);
      } else {
        toast.error("Failed to link wallet");
      }
    } catch {
      toast.error("Failed to link wallet");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{user?.name}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-sky-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Credit Score
                  </div>
                  <p className="text-3xl font-bold text-sky-600">{user?.creditScore || 100}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay on time to increase your score
                  </p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Wallet className="w-4 h-4" />
                    Wallet Status
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {user?.walletAddress ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Linked
                      </span>
                    ) : (
                      <span className="text-orange-600">Not Linked</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>
                Link your Polygon wallet to receive payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="wallet"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono border-sky-200"
                  />
                  <Button 
                    onClick={saveWallet}
                    disabled={saving}
                    className="bg-sky-500 hover:bg-sky-600"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Link
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Enter your Polygon wallet address to receive USDC payments
                </p>
              </div>

              {user?.walletAddress && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-sm font-mono text-green-600 break-all">
                    {user.walletAddress}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-sky-100 bg-gradient-to-br from-sky-500 to-sky-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Why Link Your Wallet?</h3>
              <ul className="space-y-2 text-sky-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Receive payments in USDC on Polygon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Friends can pay you with any crypto
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Low fees and instant settlements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Build your credit score by paying on time
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
