"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BarChart3, TrendingUp, DollarSign, Users, Receipt, PieChart } from "lucide-react";
import { motion } from "framer-motion";

interface Analytics {
  totalExpenses: number;
  totalGroups: number;
  totalMembers: number;
  categoryBreakdown: { [key: string]: number };
  monthlyExpenses: { month: string; amount: number }[];
  topSpenders: { name: string; amount: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalExpenses: 0,
    totalGroups: 0,
    totalMembers: 0,
    categoryBreakdown: {},
    monthlyExpenses: [],
    topSpenders: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [groupsRes, expensesRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/expenses')
      ]);

      if (groupsRes.ok && expensesRes.ok) {
        const { groups } = await groupsRes.json();
        const { expenses } = await expensesRes.json();

        const categoryBreakdown: { [key: string]: number } = {};
        let totalExpenses = 0;
        let uniqueMembers = new Set();

        expenses?.forEach((expense: any) => {
          totalExpenses += expense.amount;
          categoryBreakdown[expense.category] = 
            (categoryBreakdown[expense.category] || 0) + expense.amount;
        });

        groups?.forEach((group: any) => {
          group.members?.forEach((member: any) => {
            uniqueMembers.add(member.userId);
          });
        });

        setAnalytics({
          totalExpenses,
          totalGroups: groups?.length || 0,
          totalMembers: uniqueMembers.size,
          categoryBreakdown,
          monthlyExpenses: [],
          topSpenders: []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const stats = [
    {
      label: 'Total Expenses',
      value: `$${analytics.totalExpenses.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      label: 'Active Groups',
      value: analytics.totalGroups.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+3'
    },
    {
      label: 'Total Members',
      value: analytics.totalMembers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+8'
    },
    {
      label: 'Avg per Expense',
      value: `$${(analytics.totalExpenses / Math.max(Object.keys(analytics.categoryBreakdown).length, 1)).toFixed(2)}`,
      icon: Receipt,
      color: 'bg-sky-500',
      change: '+5.2%'
    }
  ];

  const categories = Object.entries(analytics.categoryBreakdown).map(([name, amount]) => ({
    name,
    amount,
    percentage: ((amount / analytics.totalExpenses) * 100).toFixed(1)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600">Insights into your expense patterns and trends</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-slate-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-sky-500" />
              <h2 className="text-xl font-semibold text-slate-900">Category Breakdown</h2>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No expense data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700 font-medium capitalize">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-semibold">${category.amount.toFixed(2)}</span>
                        <span className="text-sm text-slate-500">({category.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-sky-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <h2 className="text-xl font-semibold text-slate-900">Spending Insights</h2>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Average expense amount</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${(analytics.totalExpenses / Math.max(Object.keys(analytics.categoryBreakdown).length, 1)).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Most common category</p>
                <p className="text-xl font-semibold text-slate-900 capitalize">
                  {categories[0]?.name || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Total expenses this month</p>
                <p className="text-3xl font-bold text-sky-500">
                  ${analytics.totalExpenses.toFixed(2)}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500">
                  💡 Tip: Create more groups to better organize your expenses and get detailed insights.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
