import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuantroLanding() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Track What Fuels You.</h1>
        <p className="text-zinc-300 text-lg md:text-xl mb-8">
          Built for lifters, athletes, and nutrition nerds. No fluff—just precise food logging,
          micronutrient analysis, and results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Input
            type="email"
            placeholder="Your email"
            className="bg-zinc-800 text-white placeholder-zinc-400"
          />
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md">
            Join Waitlist
          </Button>
        </div>
        <p className="text-sm text-zinc-500 mt-6">© 2025 Quantro. All rights reserved.</p>
      </div>
    </main>
  );
}
