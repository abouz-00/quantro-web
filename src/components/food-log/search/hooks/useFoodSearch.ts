import { useState, useEffect } from "react";

export function useFoodSearch(query: string, active: boolean) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (active && query.length > 2) {
      setLoading(true);
      setError("");
      const timeoutId = setTimeout(async () => {
        try {
          const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
          const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
          );
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setSuggestions(data.foods || []);
          setLoading(false);
        } catch (err: any) {
          setSuggestions([]);
          setError(err?.message || "Failed to fetch food data.");
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setLoading(false);
      setError("");
    }
  }, [query, active]);

  return { suggestions, loading, error };
}
