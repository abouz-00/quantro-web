import React, { useState, useRef, useMemo, useEffect } from "react";
import { FaStar } from "react-icons/fa";

interface USDAFood {
  description: string;
  foodCategory?: string;
  foodNutrients: { nutrientName: string; value: number }[];
  servingSize?: number;
  servingSizeUnit?: string;
  isFavorite?: boolean;
  uniqueId?: string;
  fdcId?: number;
}

interface FavoritesTabProps {
  favorites: USDAFood[];
  selectedFood: USDAFood | null;
  handleSelectFood: (food: USDAFood, idx: number) => void;
  toggleFavorite: (food: USDAFood) => void;
  capitalizeWords: (str: string) => string;
  loading?: boolean;
  error?: string;
}

export default function FavoritesTab({
  favorites,
  selectedFood,
  handleSelectFood,
  toggleFavorite,
  capitalizeWords,
  loading = false,
  error = "",
}: FavoritesTabProps) {
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const memoizedFavorites = useMemo(() => favorites, [favorites]);

  // Reset highlight on favorites change
  useEffect(() => {
    setHighlightedIdx(-1);
  }, [memoizedFavorites]);

  // Keyboard navigation for favorites list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (memoizedFavorites.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIdx((prev) => (prev + 1) % memoizedFavorites.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIdx((prev) => (prev - 1 + memoizedFavorites.length) % memoizedFavorites.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      handleSelectFood(memoizedFavorites[highlightedIdx], highlightedIdx + 1000);
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (highlightedIdx >= 0 && rowRefs.current[highlightedIdx]) {
      rowRefs.current[highlightedIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIdx]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-medium mb-3">Your Favorite Foods</h3>
      {loading && <div className="py-8 text-center text-gray-400">Loading...</div>}
      {error && !loading && <div className="py-8 text-center text-red-500">{error}</div>}
      {!loading && !error && memoizedFavorites.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No favorites yet.<br />
          <span className="text-violet-600">Tip:</span> Star foods from the search tab to add them here!
        </p>
      ) : null}
      {!loading && !error && memoizedFavorites.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100">
            <table
              className="w-full table-fixed"
              role="listbox"
              aria-label="Favorite foods"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <colgroup>
                <col className="w-auto" />
                <col className="w-16" />
              </colgroup>
              <tbody>
                {memoizedFavorites.map((food, idx) => (
                  <tr
                    key={idx}
                    ref={el => { rowRefs.current[idx] = el; }}
                    onClick={() => handleSelectFood(food, idx + 1000)}
                    className={`food-table-row border-b border-gray-200 last:border-0 transition-colors duration-150 cursor-pointer ${
                      selectedFood?.uniqueId === `${food.description}_${idx + 1000}`
                        ? "selected bg-violet-50 border-l-4 border-l-violet-500"
                        : "hover:bg-violet-50"
                    } ${highlightedIdx === idx ? "ring-2 ring-violet-400" : ""}`}
                    role="option"
                    aria-selected={highlightedIdx === idx}
                    tabIndex={-1}
                    onMouseEnter={() => setHighlightedIdx(idx)}
                  >
                    <td className="py-2 pl-2 pr-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="font-medium">{capitalizeWords(food.description)}</div>
                          {food.foodCategory && (
                            <div className="text-sm text-gray-500">{food.foodCategory}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(food);
                        }}
                        className="text-yellow-400 hover:text-yellow-500 cursor-pointer star-button transition-colors duration-200"
                        aria-label="Remove from favorites"
                      >
                        <FaStar size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
