"use client";

import React from "react";
import { FoodSearchModal } from "../food-log/search";
import { EditFoodModal, TargetsModal } from "../food-log/modals";
import { ActionButtons } from "./ActionButtons";
import { ContextMenu } from "./ContextMenu";
import { CopyToast } from "./CopyToast";
import { FoodEntry, Nutrients, ContextMenuState } from "../../types/food";

interface FoodLogControlsProps {
  onAddFood: () => void;
  clipboardEntries: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  onCopyCurrentDay: () => void;
  onCopySelectedItems: () => void;
  onPasteEntries: () => void;
  onDeleteSelected: () => void;
  onCopyToToday: () => void;
  isToday: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isTargetsModalOpen: boolean;
  setIsTargetsModalOpen: (open: boolean) => void;
  editModalEntry: FoodEntry | null;
  setEditModalEntry: (entry: FoodEntry | null) => void;
  selectedDate: Date;
  addFoodEntry: (entry: FoodEntry, overrideDate?: Date) => Promise<void>;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  foodData: FoodEntry[];
  contextMenu: ContextMenuState;
  onEditEntry: () => void;
  onCopyEntries: () => void;
  onDeleteSelectedEntries: () => void;
  showCopyToast: boolean;
  targetInput: Nutrients;
  onInputChange: (field: keyof Nutrients, value: number) => void;
  onSaveTargets: () => void;
}

export default function FoodLogControls({
  onAddFood,
  clipboardEntries,
  filteredEntries,
  selectedEntries,
  onCopyCurrentDay,
  onCopySelectedItems,
  onPasteEntries,
  onDeleteSelected,
  onCopyToToday,
  isToday,
  isModalOpen,
  setIsModalOpen,
  isTargetsModalOpen,
  setIsTargetsModalOpen,
  editModalEntry,
  setEditModalEntry,
  selectedDate,
  addFoodEntry,
  updateFoodEntry,
  foodData,
  contextMenu,
  onEditEntry,
  onCopyEntries,
  onDeleteSelectedEntries,
  showCopyToast,
  targetInput,
  onInputChange,
  onSaveTargets
}: FoodLogControlsProps) {
  return (
    <>
      <ActionButtons
        onAddFood={onAddFood}
        clipboardEntries={clipboardEntries}
        filteredEntries={filteredEntries}
        selectedEntries={selectedEntries}
        onCopyCurrentDay={onCopyCurrentDay}
        onCopySelectedItems={onCopySelectedItems}
        onPasteEntries={onPasteEntries}
        onDeleteSelected={onDeleteSelected}
        onCopyToToday={onCopyToToday}
        isToday={isToday}
        data-testid="action-buttons"
      />

      {/* Modals */}
      {isModalOpen && (
        <FoodSearchModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodEntry}
          selectedDate={selectedDate}
        />
      )}

      <EditFoodModal
        entry={editModalEntry}
        isOpen={!!editModalEntry}
        onClose={() => setEditModalEntry(null)}
        onSave={updateFoodEntry}
        originalEntry={editModalEntry ? foodData.find(entry => entry.id === editModalEntry.id) : undefined}
      />

      <TargetsModal
        isOpen={isTargetsModalOpen}
        onClose={() => setIsTargetsModalOpen(false)}
        targetInput={targetInput}
        onInputChange={onInputChange}
        onSave={onSaveTargets}
      />

      {/* Context Menu and Toast */}
      <ContextMenu
        contextMenu={contextMenu}
        selectedEntries={selectedEntries}
        clipboardEntries={clipboardEntries}
        onEditEntry={onEditEntry}
        onCopyEntries={onCopyEntries}
        onPasteEntries={onPasteEntries}
        onDeleteSelectedEntries={onDeleteSelectedEntries}
        data-testid="context-menu"
      />

      <CopyToast
        show={showCopyToast}
        itemCount={clipboardEntries.length}
      />
    </>
  );
}
