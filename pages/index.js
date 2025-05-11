import Head from "next/head";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Quantro — Precision Nutrition Tracking</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Track what fuels you.
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8">
          Quantro is built for serious lifters, athletes, and nutrition nerds.
          No fluff — just precise food logging, micronutrient analysis, and results.
        </p>

        <form
          action="https://formsubmit.co/your@email.com"
          method="POST"
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800"
          >
            Join Waitlist
          </button>
        </form>
      </main>

      <footer className="text-sm text-gray-500 text-center py-4">
        &copy; {new Date().getFullYear()} Quantro. All rights reserved.
      </footer>
    </div>
  );
}
