"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Wallet, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Receipt, 
  ArrowRight,
  CheckCircle2,
  Coins,
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Group Expense Tracking",
      description: "Create groups, add members, and track who paid what effortlessly"
    },
    {
      icon: Receipt,
      title: "AI Receipt Verification",
      description: "Upload receipts verified by Gemini AI to prevent fake expenses"
    },
    {
      icon: Shield,
      title: "Tamper-Proof Storage",
      description: "All receipts stored on IPFS via Pinata for permanent proof"
    },
    {
      icon: Coins,
      title: "Multi-Crypto Payments",
      description: "Pay with BTC, ETH, or any crypto - SideShift converts to USDC"
    },
    {
      icon: Zap,
      title: "Instant Settlement",
      description: "Low-fee settlements on Polygon for fast transactions"
    },
    {
      icon: Globe,
      title: "Borderless Payments",
      description: "Friends worldwide can settle using their preferred crypto"
    }
  ];

  const steps = [
    { step: "01", title: "Create a Group", desc: "Set up your expense group and invite members" },
    { step: "02", title: "Add Expenses", desc: "Upload receipts and track who paid" },
    { step: "03", title: "View Balances", desc: "See who owes whom automatically" },
    { step: "04", title: "Settle Up", desc: "Pay with any crypto, settled on Polygon" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-sky-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full text-sky-700 text-sm font-semibold mb-8 shadow-lg border border-sky-100"
            >
              <Wallet className="w-4 h-4" />
              Powered by Polygon & SideShift
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6 tracking-tight"
            >
              Split Bills,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                Settle Anywhere
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              The decentralized expense splitting platform. Track expenses with proof, 
              settle payments using any cryptocurrency from any blockchain.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/connect">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-10 py-7 text-lg rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105">
                  Connect Wallet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-600"
            >
              {["No email required", "AI-verified receipts", "Multi-chain support"].map((item, i) => (
                <motion.div 
                  key={item} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-sky-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  <span className="font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete solution for group expense management with blockchain-powered trust
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-500/30">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Split expenses in four simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-sky-200 to-sky-300 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 rounded-3xl p-12 sm:p-16 text-center text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                <FileCheck className="w-20 h-20 mx-auto mb-8 opacity-95 drop-shadow-lg" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Split Bills Fairly?
              </h2>
              <p className="text-xl sm:text-2xl text-sky-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands using BillSplitr for decentralized expense management
              </p>
              <Link href="/connect">
                <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold">
                  Connect Your Wallet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">BillSplitr</span>
            </div>
            <p className="text-slate-400 text-sm sm:text-base">
              Built with <span className="text-sky-400 font-medium">Polygon</span>, <span className="text-sky-400 font-medium">SideShift</span>, <span className="text-sky-400 font-medium">Pinata</span> & <span className="text-sky-400 font-medium">Gemini AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}