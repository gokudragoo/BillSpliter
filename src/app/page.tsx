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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 text-sm font-medium mb-8">
              <Wallet className="w-4 h-4" />
              Powered by Polygon & SideShift
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Split Bills,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">
                Settle Anywhere
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              The decentralized expense splitting platform. Track expenses with proof, 
              settle payments using any cryptocurrency from any blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connect">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 text-lg rounded-xl">
                  Connect Wallet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              {["No email required", "AI-verified receipts", "Multi-chain support"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  {item}
                </div>
              ))}
            </div>
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
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-sky-50 border border-sky-100 hover:border-sky-200 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
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
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-sky-200 mb-4">{step.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-12 text-center text-white">
            <FileCheck className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Split Bills Fairly?
            </h2>
            <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
              Join thousands using BillSplitr for decentralized expense management
            </p>
            <Link href="/connect">
              <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 px-8 py-6 text-lg rounded-xl">
                Connect Your Wallet
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BillSplitr</span>
            </div>
            <p className="text-slate-400 text-sm">
              Built with Polygon, SideShift, Pinata & Gemini AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}