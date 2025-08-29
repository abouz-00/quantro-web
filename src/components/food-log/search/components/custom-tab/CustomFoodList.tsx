import React, { useMemo } from 'react';
import Image from 'next/image';
import { CustomFood } from './types';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

interface CustomFoodListProps {
  customFoods: CustomFood[];
  onAddFromCustomList: (food: CustomFood) => void;
  isLoading?: boolean;
}

export const CustomFoodList: React.FC<CustomFoodListProps> = ({
  customFoods,
  onAddFromCustomList,
  isLoading = false,
}) => {
  const memoizedCustomFoods = useMemo(() => customFoods, [customFoods]);
  
  const {
    highlightedIdx,
    setHighlightedIdx,
    handleKeyDown,
    setRowRef,
  } = useKeyboardNavigation(memoizedCustomFoods, onAddFromCustomList, isLoading);

  if (memoizedCustomFoods.length === 0) {
    return null;
  }

  return (
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
                ref={setRowRef(idx)}
                onClick={() => {
                  if (!isLoading) {
                    onAddFromCustomList(food);
                  }
                }}
                className={`food-table-row border-b border-gray-200 last:border-0 transition-colors duration-150 ${
                  isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                } ${highlightedIdx === idx ? "ring-2 ring-violet-400" : ""}`}
                role="option"
                aria-selected={highlightedIdx === idx}
                tabIndex={-1}
                onMouseEnter={() => {
                  if (!isLoading) {
                    setHighlightedIdx(idx);
                  }
                }}
              >
                <td className="py-2 pl-2 pr-2">
                  <div className="flex items-center space-x-2">
                    <Image 
                      src="/toast.svg" 
                      alt="toast" 
                      className="w-6 h-6 flex-shrink-0" 
                      width={24} 
                      height={24} 
                    />
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
  );
};
