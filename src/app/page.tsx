import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f11] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-center mb-4">Track what fuels you.</h1>
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
    </main>
  );
}