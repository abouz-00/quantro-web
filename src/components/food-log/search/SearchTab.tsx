import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

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

interface SearchTabProps {
  localQuery: string;
  setLocalQuery: (q: string) => void;
  suggestions: USDAFood[];
  selectedFood: USDAFood | null;
  handleSelectFood: (food: USDAFood, idx: number) => void;
  toggleFavorite: (food: USDAFood) => void;
  isFavorite: (food: USDAFood) => boolean;
  capitalizeWords: (str: string) => string;
  handleAddFood: () => void;
  loading?: boolean;
  error?: string;
}

export default function SearchTab({
  localQuery,
  setLocalQuery,
  suggestions,
  selectedFood,
  handleSelectFood,
  toggleFavorite,
  isFavorite,
  capitalizeWords,
  handleAddFood,
  loading = false,
  error = "",
}: SearchTabProps) {
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Memoize suggestions for performance
  const memoizedSuggestions = useMemo(() => suggestions, [suggestions]);

  // Handle search input change
  const handleQueryChange = useCallback((value: string) => {
    setLocalQuery(value);
  }, [setLocalQuery]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (memoizedSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIdx((prev) => (prev + 1) % memoizedSuggestions.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIdx((prev) => (prev - 1 + memoizedSuggestions.length) % memoizedSuggestions.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      handleSelectFood(memoizedSuggestions[highlightedIdx], highlightedIdx);
      handleAddFood();
      e.preventDefault();
    }
  }, [memoizedSuggestions, highlightedIdx, handleSelectFood, handleAddFood]);

  useEffect(() => {
    if (highlightedIdx >= 0 && rowRefs.current[highlightedIdx]) {
      rowRefs.current[highlightedIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIdx]);

  // Accessibility: get id for highlighted row
  const getRowId = (idx: number) => `food-suggestion-row-${idx}`;

  // Use uniqueId if available for key
  const getRowKey = (food: USDAFood, idx: number) => food.uniqueId || `${food.description}_${idx}`;

  // Extract row rendering to a function for clarity
  const renderSuggestionRow = useCallback((food: USDAFood, idx: number) => (
    <tr
      key={getRowKey(food, idx)}
      id={getRowId(idx)}
      ref={el => { rowRefs.current[idx] = el; }}
      onClick={() => handleSelectFood(food, idx)}
      className={`food-table-row border-b border-gray-200 last:border-0 transition-colors duration-150 cursor-pointer ${
        selectedFood?.uniqueId === (food.uniqueId || `${food.description}_${idx}`)
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
          aria-label={isFavorite(food) ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite(food) ? <FaStar size={16} /> : <FaRegStar size={16} />}
        </button>
      </td>
    </tr>
  ), [selectedFood, highlightedIdx, capitalizeWords, isFavorite, toggleFavorite, handleSelectFood]);

  return (
    <div className="h-full flex flex-col">
      <div className="relative mt-10 mb-10">
        <div className="absolute inset-y-0 left-0 flex items-center justify-center z-30 rounded-sm" style={{background: 'rgba(156, 163, 175, 0.15)', width: '36px'}}>
          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search all foods"
          value={localQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={(e) => {
            handleInputKeyDown(e);
            if (e.key === 'Enter' && selectedFood && highlightedIdx === -1) {
              handleAddFood();
            }
          }}
          className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 placeholder-gray-400"
          autoFocus
          aria-label="Search all foods"
          aria-autocomplete="list"
          aria-controls="food-suggestion-list"
          aria-activedescendant={highlightedIdx >= 0 ? getRowId(highlightedIdx) : undefined}
        />
        {localQuery && (
          <button
            onClick={() => setLocalQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 z-30"
            style={{height: '2.5rem'}}
            aria-label="Clear search"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100">
          {loading && (
            <div className="py-4 space-y-3 px-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          )}
          {error && !loading && (
            <div className="py-8 text-center text-red-500">{error}</div>
          )}
          {!loading && !error && (
            <>
              <table className="w-full table-fixed" role="listbox" id="food-suggestion-list" aria-label="Food suggestions">
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-16" />
                </colgroup>
                <tbody>
                  {memoizedSuggestions.length === 0 && localQuery.length > 1 && (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-gray-400">No results found.</td>
                    </tr>
                  )}
                  {memoizedSuggestions.map(renderSuggestionRow)}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
