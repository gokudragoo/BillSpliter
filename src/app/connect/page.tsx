"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMetaMask(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      toast.error("Please install MetaMask or another Web3 wallet");
      return;
    }

    setLoading(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];

      // Create message to sign
      const message = `Sign this message to authenticate with BillSplitr.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      // Get signer and sign message
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Send to backend for verification
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress, 
          signature, 
          message 
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Wallet connected successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to authenticate");
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.code === 4001) {
        toast.error("You rejected the connection request");
      } else {
        toast.error("Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Navbar />
      
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-sky-100">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Sign in to BillSplitr using your crypto wallet. All expenses are stored on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasMetaMask ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-600">
                  You need a Web3 wallet to use BillSplitr
                </p>
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  Install MetaMask
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                className="w-full bg-sky-500 hover:bg-sky-600"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <WalletIcon className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                <p className="text-slate-600">
                  <strong>On-chain storage:</strong> All expenses and settlements are recorded on Polygon
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                <p className="text-slate-600">
                  <strong>No email required:</strong> Your wallet is your identity
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                <p className="text-slate-600">
                  <strong>Multi-crypto payments:</strong> Pay with 199+ cryptocurrencies via SideShift
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
