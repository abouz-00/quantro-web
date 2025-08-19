import React, { useState, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FoodEntry } from '../types';
import { FoodTableRow } from './FoodTableRow';

interface MealSectionProps {
  mealType: FoodEntry['mealType'];
  entries: FoodEntry[];
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (id: string, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  editingEntry: string | null;
  setEditingEntry: (id: string | null) => void;
  editAmount: string;
  setEditAmount: (amount: string) => void;
  editUnit: string;
  setEditUnit: (unit: string) => void;
  formatNumber: (n: number) => string;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  activeId: string | null;
  isLastSection?: boolean;
}

export const MealSection = memo(({
  mealType,
  entries,
  foodData,
  selectedEntries,
  handleEntrySelect,
  updateFoodEntry,
  editingEntry,
  setEditingEntry,
  editAmount,
  setEditAmount,
  editUnit,
  setEditUnit,
  formatNumber,
  onContextMenu,
  activeId,
  isLastSection = false
}: MealSectionProps) => {
  // State to track if the meal section is collapsed
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Drop target for the meal section
  const { setNodeRef: setDropRef } = useDroppable({
    id: `drop-${mealType}`,
    data: { type: 'meal-drop-zone', mealType }
  });

  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Determine rounded corners based on meal type and whether this is the last section
  const getRoundedClasses = () => {
    if (mealType === 'breakfast') {
      return 'rounded-t-lg'; // Top rounded corners for breakfast
    } else if (isLastSection) {
      // If this is the last section and has entries, don't round the heading bottom
      // If this is the last section and has no entries, round the heading bottom
      return entries.length > 0 ? '' : 'rounded-b-lg';
    }
    return ''; // No rounded corners for middle sections
  };

  return (
    <div>
      {/* Meal Type Heading - drop target */}
      <div 
        ref={setDropRef}
        className={`px-4 py-2 text-white font-bold text-sm border border-gray-300 border-b-black cursor-default flex items-center justify-between ${getRoundedClasses()}`}
        style={{ backgroundColor: '#2E2E2E' }}
      >
        <span>{capitalizedMealType}</span>
        <button
          onClick={toggleCollapse}
          className="ml-2 p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
          aria-label={isCollapsed ? `Expand ${capitalizedMealType}` : `Collapse ${capitalizedMealType}`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Entries container - only show if there are entries and not collapsed */}
      {entries.length > 0 && !isCollapsed && (
        <div className={`bg-white border-l border-r border-b border-gray-300 ${isLastSection ? 'rounded-b-lg' : ''}`}>
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-auto" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <tbody>
              <SortableContext 
                items={entries.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {entries.map((item, index) => (
                  <FoodTableRow
                    key={item.id}
                    item={item}
                    foodData={foodData}
                    selectedEntries={selectedEntries}
                    handleEntrySelect={handleEntrySelect}
                    updateFoodEntry={updateFoodEntry}
                    editingEntry={editingEntry}
                    setEditingEntry={setEditingEntry}
                    editAmount={editAmount}
                    setEditAmount={setEditAmount}
                    editUnit={editUnit}
                    setEditUnit={setEditUnit}
                    formatNumber={formatNumber}
                    onContextMenu={onContextMenu}
                    activeId={activeId}
                    isLastRow={isLastSection && index === entries.length - 1}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

MealSection.displayName = 'MealSection';
