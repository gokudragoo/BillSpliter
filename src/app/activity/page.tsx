"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Bell, Receipt, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";


interface Activity {
  id: string;
  type: 'expense' | 'settlement' | 'group' | 'member';
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  icon: any;
  color: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'expense' | 'settlement' | 'group'>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const groupsRes = await fetch('/api/groups');
      const expensesRes = await fetch('/api/expenses');
      
      if (groupsRes.ok && expensesRes.ok) {
        const { groups } = await groupsRes.json();
        const { expenses } = await expensesRes.json();
        
        const activityList: Activity[] = [];
        
        groups?.forEach((group: any) => {
          activityList.push({
            id: group._id,
            type: 'group',
            title: 'Group Created',
            description: `${group.name} was created`,
            timestamp: new Date(group.createdAt),
            icon: Users,
            color: 'bg-blue-500'
          });
        });
        
        expenses?.forEach((expense: any) => {
          activityList.push({
            id: expense._id,
            type: 'expense',
            title: 'Expense Added',
            description: `${expense.description} - ${expense.category}`,
            amount: expense.amount,
            timestamp: new Date(expense.createdAt),
            icon: Receipt,
            color: 'bg-sky-500'
          });
        });
        
        activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(activityList);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Activity Feed</h1>
            <p className="text-slate-600">Track all your expense activities in real-time</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All', icon: TrendingUp },
            { value: 'expense', label: 'Expenses', icon: Receipt },
            { value: 'settlement', label: 'Settlements', icon: DollarSign },
            { value: 'group', label: 'Groups', icon: Users }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-sky-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No activities yet</p>
              <p className="text-sm text-slate-400 mt-1">Start by creating a group or adding expenses</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-2">{activity.description}</p>
                    
                    {activity.amount && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium">
                        <DollarSign className="w-4 h-4" />
                        {activity.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
