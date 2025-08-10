import React from 'react';
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
  contextMenuOpen: boolean;
  setContextMenuOpen: (open: boolean) => void;
}

export function MealSection({
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
  contextMenuOpen,
  setContextMenuOpen
}: MealSectionProps) {
  // Remove sortable functionality - headings are only drop targets now
  const { setNodeRef: setDropRef } = useDroppable({
    id: `drop-${mealType}`,
    data: { type: 'meal-drop-zone', mealType }
  });

  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div>
      {/* Meal Type Heading - now only a drop target, not draggable */}
      <div 
        ref={setDropRef}
        className="bg-gray-300 px-4 py-2 text-black font-bold text-sm border border-gray-300 border-b-black cursor-default"
      >
        {capitalizedMealType}
      </div>
      
      {/* Entries container - only show if there are entries */}
      {entries.length > 0 && (
        <div className="bg-white border-l border-r border-b border-gray-300">
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
                {entries.map((item) => (
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
                    contextMenuOpen={contextMenuOpen}
                    setContextMenuOpen={setContextMenuOpen}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
