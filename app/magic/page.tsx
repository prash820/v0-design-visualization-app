"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import MagicAppBuilder from "@/components/magic-app-builder";

export default function MagicPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Main
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Magic Flow POC</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Proof of Concept</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>New Simplified Flow: Idea → Validate → Build</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="holographic">Magic App Builder</span>
            <br />
            <span className="text-primary">POC Demo</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Test the new two-step validation flow: Generate concept with diagrams, 
            validate it looks right, then build your live app in under 2 minutes.
          </p>
        </div>
      </section>

      {/* Magic App Builder */}
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <MagicAppBuilder />
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-12 px-4 bg-card/20">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How This Differs from Main App</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-red-200 bg-red-50/50">
              <h3 className="font-bold text-red-800 mb-3">❌ Current Complex Flow</h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• Multiple tabs and steps</li>
                <li>• User type selection</li>
                <li>• Manual diagram generation</li>
                <li>• Separate infrastructure/app deployment</li>
                <li>• Complex configuration options</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-lg border border-green-200 bg-green-50/50">
              <h3 className="font-bold text-green-800 mb-3">✅ New Magic Flow</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Single idea input</li>
                <li>• Auto-generate concept + diagrams</li>
                <li>• User validates before building</li>
                <li>• One-click app creation</li>
                <li>• Live URL in 90 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 