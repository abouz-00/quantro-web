export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Track what fuels you.</h1>
        <p className="text-gray-700 mb-6">
          Quantro is built for serious lifters, athletes, and nutrition nerds. No fluff — just precise food logging, micronutrient analysis, and results.
        </p>
        <form className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            type="email"
            placeholder="Your email"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Join Waitlist
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-6">&copy; 2025 Quantro. All rights reserved.</p>
      </div>
    </div>
  );
}
