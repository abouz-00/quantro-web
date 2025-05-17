"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Quantro</h1>
      <p className="text-lg text-muted-foreground text-center max-w-xl mb-6">
        Quantro is built for serious users. Log your food intake, analyze micronutrients, and optimize performance.
      </p>

      <form className="flex w-full max-w-md gap-2 mb-12">
        <Input
          type="email"
          placeholder="Enter your email"
          className="flex-1 border border-slate-700 bg-transparent text-white placeholder:text-muted-foreground"
        />
        <Button className="bg-violet-500 hover:bg-violet-600 text-white px-6">Join Waitlist</Button>
      </form>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-3xl mb-2">📊</div>
          <p className="font-semibold">Nutrition logging</p>
        </div>
        <div>
          <div className="text-3xl mb-2">📈</div>
          <p className="font-semibold">Detailed analysis</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🎯</div>
          <p className="font-semibold">Custom targets</p>
        </div>
      </div>
      <div className="mt-12">
        <Link href="/log">
          <Button variant="outline" className="text-violet-500 border-violet-500 hover:bg-violet-500 hover:text-white">
            Log your food
          </Button>
        </Link>
      </div>
    </main>
  );
}