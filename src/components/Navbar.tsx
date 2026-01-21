"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Wallet, 
  LayoutDashboard, 
  Users, 
  Receipt, 
  CreditCard,
  LogOut,
  User,
  Bell,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  id: string;
  name: string;
  walletAddress: string;
  creditScore: number;
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/settle", label: "Settle", icon: CreditCard },
    { href: "/activity", label: "Activity", icon: Bell },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  const truncateAddress = (address: string | null) => {
    if (!address) return "No wallet";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-sky-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">BillSplitr</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "secondary" : "ghost"} 
                    size="sm"
                    className={`transition-all duration-200 ${
                      isActive(link.href) 
                        ? "bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 shadow-sm" 
                        : "text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                    }`}
                  >
                    <link.icon className="w-4 h-4 mr-1.5" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-50 to-sky-100 rounded-full border border-sky-200 shadow-sm">
                  <span className="text-xs text-sky-700 font-semibold">Score: <span className="text-sky-600">{user.creditScore}</span></span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-sky-50 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center border border-sky-200">
                        <Wallet className="w-4 h-4 text-sky-600" />
                      </div>
                      <span className="hidden sm:inline text-slate-700 font-mono text-xs font-medium">
                        {truncateAddress(user.walletAddress)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/connect">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            )}

            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-sky-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  isActive(link.href) ? "bg-sky-100 text-sky-700" : "text-slate-600"
                }`}>
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}