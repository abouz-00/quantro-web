"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Quantro</h1>
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