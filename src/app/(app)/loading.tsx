export default function AppLoading() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: '#F5F0E7' }}>
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#6e44ff' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="h-10 w-28 bg-white/20 rounded-lg" />
          <div className="h-9 w-20 bg-white/20 rounded-lg" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Greeting skeleton */}
        <div className="pt-2 space-y-2">
          <div className="h-9 w-72 bg-black/5 rounded-lg" />
          <div className="h-6 w-56 bg-black/5 rounded-lg" />
        </div>

        {/* Main card skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-36 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-50 rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-2 bg-gray-100 rounded-full" />
            <div className="h-2 bg-gray-100 rounded-full" />
            <div className="h-2 bg-gray-100 rounded-full" />
            <div className="h-2 bg-gray-100 rounded-full" />
          </div>
          <div className="h-12 bg-gray-100 rounded-xl mt-4" />
        </div>

        {/* Feature cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-36 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
