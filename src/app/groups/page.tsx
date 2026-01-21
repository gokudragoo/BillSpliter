"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  ArrowRight,
  Loader2,
  Copy,
  UserPlus
} from "lucide-react";

interface Group {
  _id: string;
  name: string;
  description: string;
  currency: string;
  members: { userId: string; name: string }[];
  totalExpenses: number;
  inviteCode: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", currency: "INR" });
  const [inviteCode, setInviteCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/groups");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Group created! Invite code: " + data.inviteCode);
        setCreateOpen(false);
        setNewGroup({ name: "", description: "", currency: "INR" });
        fetchGroups();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Joined group successfully!");
        setJoinOpen(false);
        setInviteCode("");
        fetchGroups();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to join group");
    } finally {
      setJoining(false);
    }
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
            <p className="text-slate-600 mt-1">Manage your expense groups</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-sky-200 text-sky-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Group</DialogTitle>
                  <DialogDescription>Enter the invite code to join an existing group</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="e.g. ABC123"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="border-sky-200"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={joining}>
                    {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Join Group
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Group</DialogTitle>
                  <DialogDescription>Set up a new expense group</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">Group Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Goa Trip 2025"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Description (optional)</Label>
                    <Input
                      id="description"
                      placeholder="What's this group for?"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="font-semibold">Currency</Label>
                    <Select value={newGroup.currency} onValueChange={(v) => setNewGroup({ ...newGroup, currency: v })}>
                      <SelectTrigger className="border-sky-200 focus:border-sky-400 focus:ring-sky-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg" disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Group
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {groups.length === 0 ? (
          <Card className="border-sky-100 shadow-sm">
            <CardContent className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Groups Yet</h2>
              <p className="text-slate-600 mb-8">Create a group or join one using an invite code</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setJoinOpen(true)} className="border-sky-200 hover:bg-sky-50 hover:border-sky-300">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
                <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group._id} className="border-sky-100 hover:border-sky-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyInviteCode(group.inviteCode)}
                      className="text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-4 text-xl font-bold">{group.name}</CardTitle>
                  {group.description && (
                    <p className="text-sm text-slate-600 mt-2">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-5 pb-4 border-b border-sky-100">
                    <span className="text-slate-600 font-medium">{group.members?.length || 0} members</span>
                    <span className="font-mono bg-gradient-to-r from-sky-100 to-sky-50 px-3 py-1.5 rounded-lg text-sky-700 font-semibold border border-sky-200">
                      {group.inviteCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
                      <p className="text-xl font-bold text-slate-900">
                        {group.currency} {(group.totalExpenses || 0).toLocaleString()}
                      </p>
                    </div>
                    <Link href={`/groups/${group._id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sm">
                        View
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
