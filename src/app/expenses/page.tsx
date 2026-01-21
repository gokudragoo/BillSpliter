"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Receipt, 
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle
} from "lucide-react";

interface Group {
  _id: string;
  name: string;
  currency: string;
  members: { userId: string; name: string }[];
}

interface ReceiptAnalysis {
  isValid: boolean;
  isFake: boolean;
  amount: number | null;
  merchant: string | null;
  category: string | null;
  confidence: number;
  reason: string;
}

function ExpensesContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId") || "";
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroupId);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const currentGroup = groups.find(g => g._id === selectedGroup);

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value);
    const group = groups.find(g => g._id === value);
    if (group) {
      setSplitBetween(group.members.map(m => m.userId));
    }
  }, [groups]);

  useEffect(() => {
    if (selectedGroup && groups.length > 0) {
      handleGroupChange(selectedGroup);
    }
  }, [selectedGroup, groups, handleGroupChange]);

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
        if (initialGroupId) {
          const group = data.find((g: Group) => g._id === initialGroupId);
          if (group) {
            setSplitBetween(group.members.map((m: { userId: string }) => m.userId));
          }
        }
      }
    } catch {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const base64Reader = new FileReader();
      base64Reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        
        const res = await fetch("/api/receipts/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 })
        });

        if (res.ok) {
          const data = await res.json();
          setAnalysis(data);
          
          if (data.amount && !amount) setAmount(data.amount.toString());
          if (data.merchant && !description) setDescription(data.merchant);
          if (data.category) setCategory(data.category);
          
          if (data.isFake) {
            toast.error("Receipt appears to be fake or edited!");
          } else if (data.isValid) {
            toast.success("Receipt verified successfully!");
          }
        }
      };
      base64Reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to analyze receipt");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    if (splitBetween.length === 0) {
      toast.error("Please select members to split with");
      return;
    }

    setSubmitting(true);
    let receiptHash = null;

    try {
      if (receiptFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", receiptFile);
        
        const uploadRes = await fetch("/api/receipts/upload", {
          method: "POST",
          body: formData
        });

        if (uploadRes.ok) {
          const { ipfsHash } = await uploadRes.json();
          receiptHash = ipfsHash;
        }
        setUploading(false);
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup,
          description,
          amount,
          category,
          splitBetween,
          receiptHash,
          receiptAnalysis: analysis
        })
      });

      if (res.ok) {
        toast.success("Expense added successfully!");
        router.push(`/groups/${selectedGroup}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add expense");
      }
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
      setUploading(false);
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
          <h1 className="text-3xl font-bold text-slate-900">Add Expense</h1>
          <p className="text-slate-600 mt-1">Record a new expense with optional receipt verification</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Receipt Upload (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-sky-200 rounded-2xl p-10 text-center hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                    id="receipt"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt" className="max-h-64 mx-auto rounded-xl shadow-lg" />
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 text-sky-500" />
                        </div>
                        <p className="text-slate-700 font-medium mb-1">Click to upload receipt</p>
                        <p className="text-sm text-slate-500">AI will verify and extract details</p>
                      </>
                    )}
                  </label>
                </div>

                {analyzing && (
                  <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl border border-sky-200">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                    <span className="text-sky-700 font-medium">Analyzing receipt with Gemini AI...</span>
                  </div>
                )}

                {analysis && (
                  <div className={`p-5 rounded-xl border-2 shadow-sm ${
                    analysis.isFake 
                      ? "bg-red-50 border-red-200" 
                      : analysis.isValid 
                        ? "bg-green-50 border-green-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {analysis.isFake ? (
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                      ) : analysis.isValid ? (
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="font-bold text-lg block">
                          {analysis.isFake 
                            ? "Suspicious Receipt Detected" 
                            : analysis.isValid 
                              ? "Receipt Verified"
                              : "Unable to Verify"}
                        </span>
                        <span className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <Sparkles className="w-4 h-4" />
                          {analysis.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{analysis.reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="group">Group</Label>
                <Select value={selectedGroup} onValueChange={handleGroupChange}>
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What was this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-sky-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currentGroup?.currency || "INR"})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-sky-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="border-sky-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentGroup && (
                <div className="space-y-2">
                  <Label>Split Between</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentGroup.members.map((member) => (
                      <div key={member.userId} className="flex items-center space-x-2">
                        <Checkbox
                          id={member.userId}
                          checked={splitBetween.includes(member.userId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSplitBetween([...splitBetween, member.userId]);
                            } else {
                              setSplitBetween(splitBetween.filter(id => id !== member.userId));
                            }
                          }}
                        />
                        <label htmlFor={member.userId} className="text-sm text-slate-700">
                          {member.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href={selectedGroup ? `/groups/${selectedGroup}` : "/groups"} className="flex-1">
              <Button type="button" variant="outline" className="w-full border-sky-200">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1 bg-sky-500 hover:bg-sky-600"
              disabled={submitting || !selectedGroup}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Uploading to IPFS..." : "Adding..."}
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sky-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </div>
    }>
      <ExpensesContent />
    </Suspense>
  );
}
