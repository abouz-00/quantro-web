import React, { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FoodEntry } from '../types';
import { FoodTableRow } from './FoodTableRow';

interface MealSectionProps {
  mealType: FoodEntry['mealType'];
  entries: FoodEntry[];
  foodData: FoodEntry[];
  selectedEntries: string[];
  handleEntrySelect: (
    id: string,
    index: number,
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => void;
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
  dragOverTarget: string | null;
  isLastSection?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  dragOverTarget,
  isLastSection = false,
  isCollapsed,
  onToggleCollapse
}: MealSectionProps) => {
  // Drop target for the meal body only. The header is intentionally not droppable
  // because it steals collision during upward drags and causes reverse jumps.
  const droppableData = useMemo(
    () => ({ type: 'meal-drop-zone' as const, mealType }),
    [mealType]
  );
  const droppableConfig = useMemo(
    () => ({
      id: `drop-${mealType}`,
      data: droppableData,
      resizeObserverConfig: {
        disabled: true,
      },
    }),
    [droppableData, mealType]
  );
  const { setNodeRef: setDropRef } = useDroppable(droppableConfig);

  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const getRoundedClasses = () => {
    if (mealType === 'breakfast') {
      return 'rounded-t-lg';
    } else if (isLastSection) {
      return (entries.length > 0 && !isCollapsed) ? '' : 'rounded-b-lg';
    }
    return '';
  };

  return (
    <div>
      {/* Meal Type Heading */}
      <div 
        data-meal-header={mealType}
        className={`px-4 py-2 text-white font-bold text-sm border border-gray-300 border-b-black cursor-default flex items-center justify-between ${getRoundedClasses()}`}
        style={{ backgroundColor: '#2E2E2E' }}
      >
        <span>{capitalizedMealType}</span>
        <button
          onClick={onToggleCollapse}
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
      
      {/* Meal body is the drop target, not the header */}
      {!isCollapsed && entries.length > 0 && (
        <div
          ref={setDropRef}
          className={`bg-white border-l border-r border-b border-gray-300 ${isLastSection ? 'rounded-b-lg' : ''}`}
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
        </div>
      )}

      {!isCollapsed && entries.length === 0 && (
        <div
          ref={setDropRef}
          className={`min-h-12 border-l border-r border-b border-gray-300 bg-white ${isLastSection ? 'rounded-b-lg' : ''}`}
        />
      )}
    </div>
  );
});

MealSection.displayName = 'MealSection';
