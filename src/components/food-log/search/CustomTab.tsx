import React, { useState, useRef, useMemo, useEffect } from "react";
import Image from 'next/image';

interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface CustomTabProps {
  customName: string;
  setCustomName: (v: string) => void;
  customCalories: string;
  setCustomCalories: (v: string) => void;
  customProtein: string;
  setCustomProtein: (v: string) => void;
  customCarbs: string;
  setCustomCarbs: (v: string) => void;
  customFat: string;
  setCustomFat: (v: string) => void;
  customFiber: string;
  setCustomFiber: (v: string) => void;
  handleAddCustomFood: () => void;
  customFoods: CustomFood[];
  handleAddFromCustomList: (food: CustomFood) => void;
}

export default function CustomTab({
  customName,
  setCustomName,
  customCalories,
  setCustomCalories,
  customProtein,
  setCustomProtein,
  customCarbs,
  setCustomCarbs,
  customFat,
  setCustomFat,
  customFiber,
  setCustomFiber,
  handleAddCustomFood,
  customFoods,
  handleAddFromCustomList,
}: CustomTabProps) {
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const memoizedCustomFoods = useMemo(() => customFoods, [customFoods]);

  useEffect(() => {
    setHighlightedIdx(-1);
  }, [memoizedCustomFoods]);

  // Keyboard navigation for custom foods
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (memoizedCustomFoods.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIdx((prev) => (prev + 1) % memoizedCustomFoods.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIdx((prev) => (prev - 1 + memoizedCustomFoods.length) % memoizedCustomFoods.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      handleAddFromCustomList(memoizedCustomFoods[highlightedIdx]);
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
      <div className="mb-6">
        <h3 className="font-medium mb-3">Create Custom Food</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Food Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customName.trim()) {
                  handleAddCustomFood();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="e.g., Homemade Pizza"
              aria-label="Custom food name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Calories (per 100g)</label>
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="0"
              aria-label="Calories per 100g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Protein (g)</label>
            <input
              type="number"
              value={customProtein}
              onChange={(e) => setCustomProtein(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="0"
              aria-label="Protein in grams"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Carbs (g)</label>
            <input
              type="number"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="0"
              aria-label="Carbohydrates in grams"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fat (g)</label>
            <input
              type="number"
              value={customFat}
              onChange={(e) => setCustomFat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="0"
              aria-label="Fat in grams"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fiber (g)</label>
            <input
              type="number"
              value={customFiber}
              onChange={(e) => setCustomFiber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-sm"
              placeholder="0"
              aria-label="Fiber in grams"
            />
          </div>
        </div>
        <button
          onClick={handleAddCustomFood}
          disabled={!customName.trim()}
          className="mt-4 w-full bg-violet-500 text-white py-2 px-4 rounded-sm hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
        >
          Add Custom Food
        </button>
      </div>
      {memoizedCustomFoods.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-center">No custom foods yet.<br />Create one above to get started!</p>
        </div>
      )}
      {memoizedCustomFoods.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="font-medium mb-3">Your Custom Foods</h3>
          <div className="bg-white rounded-sm shadow-sm border border-gray-100">
            <table
              className="w-full table-fixed"
              role="listbox"
              aria-label="Custom foods"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <colgroup>
                <col className="w-auto" />
              </colgroup>
              <tbody>
                {memoizedCustomFoods.map((food, idx) => (
                  <tr
                    key={food.id}
                    ref={el => { rowRefs.current[idx] = el; }}
                    onClick={() => handleAddFromCustomList(food)}
                    className={`food-table-row border-b border-gray-200 last:border-0 transition-colors duration-150 cursor-pointer hover:bg-gray-50 ${highlightedIdx === idx ? "ring-2 ring-violet-400" : ""}`}
                    role="option"
                    aria-selected={highlightedIdx === idx}
                    tabIndex={-1}
                    onMouseEnter={() => setHighlightedIdx(idx)}
                  >
                    <td className="py-2 pl-2 pr-2">
                      <div className="flex items-center space-x-2">
                        <Image src="/src/components/food-log/table/toast.svg" alt="toast" className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                        <div className="flex-1">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500">
                            {food.calories} kcal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                          </div>
                        </div>
                      </div>
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
