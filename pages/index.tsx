import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Track what fuels you.
        </h1>
        <p className="text-gray-700 mb-6">
          Quantro is built for serious lifters, athletes, and nutrition nerds.
          No fluff — just precise food logging, micronutrient analysis, and results.
        </p>
        <form className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <Input
            type="email"
            placeholder="Your email"
            className="w-full sm:w-auto"
            required
          />
          <Button type="submit" className="w-full sm:w-auto">
            Join Waitlist
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-6">
          &copy; 2025 Quantro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
