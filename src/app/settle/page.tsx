"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { 
  CreditCard,
  Loader2,
  ArrowRight,
  Copy,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wallet,
  ArrowLeftRight
} from "lucide-react";

interface Group {
  _id: string;
  name: string;
  currency: string;
  members: { userId: string; name: string }[];
}

interface Coin {
  coin: string;
  name: string;
  network: string;
}

interface Shift {
  id: string;
  depositAddress: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositMin?: string;
  depositMax?: string;
  status: string;
  expiresAt: string;
}

function SettleContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId") || "";
  const initialTo = searchParams.get("to") || "";
  const initialAmount = searchParams.get("amount") || "";
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroupId);
  const [toUserId, setToUserId] = useState<string>(initialTo);
  const [amount, setAmount] = useState<string>(initialAmount);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingShift, setCreatingShift] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [groupsRes, coinsRes, userRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/sideshift/coins"),
        fetch("/api/auth/me")
      ]);

      if (groupsRes.status === 401) {
        router.push("/login");
        return;
      }

      if (groupsRes.ok) setGroups(await groupsRes.json());
      if (coinsRes.ok) {
        const data = await coinsRes.json();
        setCoins(data.popularCoins || []);
      }
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.walletAddress) {
          setWalletAddress(userData.walletAddress);
        }
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const currentGroup = groups.find(g => g._id === selectedGroup);
  const currentMember = currentGroup?.members.find(m => m.userId === toUserId);

  async function createShift() {
    if (!walletAddress) {
      toast.error("Please enter the recipient's wallet address");
      return;
    }
    if (!selectedCoin || !selectedNetwork) {
      toast.error("Please select a cryptocurrency");
      return;
    }

    setCreatingShift(true);
    try {
      const res = await fetch("/api/sideshift/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settleAddress: walletAddress,
          depositCoin: selectedCoin,
          depositNetwork: selectedNetwork,
          settleCoin: "USDC",
          settleNetwork: "polygon"
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setShift(data);
        toast.success("Payment shift created!");
      } else {
        toast.error(data.error || "Failed to create shift");
      }
    } catch {
      toast.error("Failed to create payment shift");
    } finally {
      setCreatingShift(false);
    }
  }

  async function checkStatus() {
    if (!shift) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/sideshift/shift?shiftId=${shift.id}`);
      if (res.ok) {
        const data = await res.json();
        setShift(data);
        
        if (data.status === "settled") {
          toast.success("Payment completed!");
          await fetch("/api/settlements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: selectedGroup,
              toUserId,
              toUserName: currentMember?.name,
              amount,
              paymentMethod: "sideshift",
              shiftId: shift.id,
              txHash: data.settleHash
            })
          });
        }
      }
    } catch {
      toast.error("Failed to check status");
    } finally {
      setCheckingStatus(false);
    }
  }

  function copyAddress() {
    if (shift?.depositAddress) {
      navigator.clipboard.writeText(shift.depositAddress);
      toast.success("Address copied!");
    }
  }

  function handleCoinSelect(value: string) {
    const [coin, network] = value.split("-");
    setSelectedCoin(coin);
    setSelectedNetwork(network);
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
          <h1 className="text-3xl font-bold text-slate-900">Settle Payment</h1>
          <p className="text-slate-600 mt-1">Pay with any cryptocurrency using SideShift</p>
        </div>

        {!shift ? (
          <div className="space-y-6">
            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Select who you want to pay and how</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="border-sky-200">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentGroup && (
                  <div className="space-y-2">
                    <Label>Pay To</Label>
                    <Select value={toUserId} onValueChange={setToUserId}>
                      <SelectTrigger className="border-sky-200">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentGroup.members.map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (for reference)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-sky-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipient Wallet Address (Polygon USDC)</Label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="border-sky-200 font-mono"
                  />
                  <p className="text-xs text-slate-500">The recipient will receive USDC on Polygon</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle>Select Cryptocurrency</CardTitle>
                <CardDescription>Choose how you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {coins.map((coin) => (
                    <button
                      key={`${coin.coin}-${coin.network}`}
                      onClick={() => handleCoinSelect(`${coin.coin}-${coin.network}`)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCoin === coin.coin && selectedNetwork === coin.network
                          ? "border-sky-500 bg-sky-50"
                          : "border-sky-100 hover:border-sky-200"
                      }`}
                    >
                      <p className="font-bold text-slate-900">{coin.coin}</p>
                      <p className="text-xs text-slate-500">{coin.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-sky-200">Cancel</Button>
              </Link>
              <Button 
                onClick={createShift}
                className="flex-1 bg-sky-500 hover:bg-sky-600"
                disabled={creatingShift || !selectedCoin || !walletAddress}
              >
                {creatingShift ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Create Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-sky-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Send Your Payment</CardTitle>
                  <CardDescription>
                    Send {selectedCoin} to the address below
                  </CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  shift.status === "settled" 
                    ? "bg-green-100 text-green-700"
                    : shift.status === "waiting"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-sky-100 text-sky-700"
                }`}>
                  {shift.status === "settled" ? (
                    <><CheckCircle2 className="w-4 h-4 inline mr-1" />Completed</>
                  ) : (
                    <><Clock className="w-4 h-4 inline mr-1" />Waiting</>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <QRCodeSVG 
                    value={shift.depositAddress} 
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#0ea5e9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input 
                    value={shift.depositAddress} 
                    readOnly 
                    className="font-mono text-sm border-sky-200"
                  />
                  <Button variant="outline" size="icon" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">You Send</p>
                  <p className="font-bold text-slate-900">{selectedCoin}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">They Receive</p>
                  <p className="font-bold text-slate-900">USDC (Polygon)</p>
                </div>
                {shift.depositMin && (
                  <div>
                    <p className="text-xs text-slate-500">Min Deposit</p>
                    <p className="font-medium text-slate-900">{shift.depositMin} {selectedCoin}</p>
                  </div>
                )}
                {shift.depositMax && (
                  <div>
                    <p className="text-xs text-slate-500">Max Deposit</p>
                    <p className="font-medium text-slate-900">{shift.depositMax} {selectedCoin}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-sky-200"
                  onClick={checkStatus}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Check Status
                </Button>
                {shift.status === "settled" && (
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Done
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-xs text-center text-slate-500">
                Powered by SideShift.ai - Send any crypto, settle in USDC
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function SettlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sky-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </div>
    }>
      <SettleContent />
    </Suspense>
  );
}
