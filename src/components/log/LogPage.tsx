"use client";

import React, { useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useDateManager } from "../../hooks/useDateManager";
import { useFoodData } from "../../hooks/useFoodData";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useClipboard } from "../../hooks/useClipboard";
import { useGoals } from "../../hooks/useGoals";
import { useDragContainment } from "../../hooks/useDragContainment";
import { FoodEntry } from "../../types/food";
import { generateEntryId } from "../../utils/dateUtils";

// Dynamic imports for better performance
const FoodLogHeader = dynamic(() => import('./FoodLogHeader'));
const FoodLogStats = dynamic(() => import('./FoodLogStats'));
const FoodLogControls = dynamic(() => import('./FoodLogControls'));
const DynamicFoodLogTable = dynamic(() => import('../food-log').then(mod => mod.FoodLogTable));

export default function LogPage() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(false);
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState<boolean>(false);
  const [editModalEntry, setEditModalEntry] = useState<FoodEntry | null>(null);

  // Date management
  const {
    selectedDate,
    setSelectedDate,
    formatApiDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    isToday
  } = useDateManager({
    enableLocalStorage: true,
    storageKey: 'foodLogSelectedDate',
    defaultToTodayOnRefresh: true
  });

  // Food data management
  const {
    foodData,
    selectedEntries,
    setSelectedEntries,
    filteredEntries,
    displayTotals,
    addFoodEntry,
    removeFoodEntry,
    updateFoodEntry,
    handleReorderEntries,
    handleEntrySelect
  } = useFoodData(selectedDate, formatApiDate);

  // Context menu
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  // Clipboard functionality
  const { clipboardEntries, showCopyToast, copyEntries, pasteEntries } = useClipboard();

  // Goals management
  const { customGoals, targetInput, handleInputChange, handleSaveTargets } = useGoals();

  // Drag containment
  useDragContainment();

  // Context menu handlers
  const handleEditEntry = () => {
    const entryToEdit = contextMenu.targetEntryId 
      ? foodData.find(entry => entry.id === contextMenu.targetEntryId)
      : selectedEntries.length === 1 
        ? foodData.find(entry => entry.id === selectedEntries[0])
        : null;
    
    if (entryToEdit) {
      setEditModalEntry(entryToEdit);
    }
    closeContextMenu();
  };

  const handleCopyEntries = () => {
    const entriesToCopy = selectedEntries.length > 0 
      ? foodData.filter(entry => selectedEntries.includes(entry.id))
      : contextMenu.targetEntryId 
        ? foodData.filter(entry => entry.id === contextMenu.targetEntryId)
        : [];
    
    copyEntries(entriesToCopy);
    closeContextMenu();
  };

  const handleCopyCurrentDay = () => {
    copyEntries(filteredEntries);
  };

  const handleCopySelectedItems = () => {
    if (selectedEntries.length === 0) return;
    const entriesToCopy = foodData.filter(entry => selectedEntries.includes(entry.id));
    copyEntries(entriesToCopy);
  };

  const handleCopyToToday = async () => {
    if (filteredEntries.length === 0) return;
    
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    try {
      // Copy all entries from current day to today
      const copyPromises = filteredEntries.map(async (entry) => {
        const newEntry = {
          ...entry,
          id: generateEntryId(), // Generate new unique ID
          date: todayNormalized.toISOString()
        };
        
        // Use addFoodEntry with override date to copy to today
        return await addFoodEntry(newEntry, todayNormalized);
      });
      
      await Promise.all(copyPromises);
    } catch (error) {
      console.error('Error copying entries to today:', error);
    }
  };

  const handlePasteEntries = () => {
    pasteEntries(selectedDate, addFoodEntry);
    closeContextMenu();
  };

  const handleDeleteSelectedEntries = () => {
    const entriesToDelete = selectedEntries.length > 0 
      ? selectedEntries
      : contextMenu.targetEntryId 
        ? [contextMenu.targetEntryId]
        : [];
    
    entriesToDelete.forEach(id => removeFoodEntry(id));
    closeContextMenu();
  };

  const handleDeleteSelected = () => {
    if (selectedEntries.length > 0) {
      selectedEntries.forEach(id => removeFoodEntry(id));
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAddFood: () => setIsModalOpen(true),
    onNextDay: goToNextDay,
    onPreviousDay: goToPreviousDay,
    onGoToToday: goToToday,
    onCopy: selectedEntries.length > 0 ? handleCopySelectedItems : undefined,
    onPaste: clipboardEntries.length > 0 ? handlePasteEntries : undefined,
    onDelete: selectedEntries.length > 0 ? () => selectedEntries.forEach(id => removeFoodEntry(id)) : undefined
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E7' }}>
      <Suspense fallback={<div>Loading header...</div>}>
        <FoodLogHeader
          isMainMenuOpen={isMainMenuOpen}
          setIsMainMenuOpen={setIsMainMenuOpen}
          setIsTargetsModalOpen={setIsTargetsModalOpen}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </Suspense>
      
      {/* Content Area with Flex Layout */}
      <div className="flex rounded-t-3xl bg-inherit" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Main Content Area */}
        <div 
          className="flex-1 transition-all duration-300 ease-out overflow-y-auto rounded-t-3xl"
          style={{ minWidth: 0, backgroundColor: '#F5F0E7' }}
        >
          <div className="container mx-auto px-4 py-8 pb-40">
            <Suspense fallback={<div>Loading controls...</div>}>
              <FoodLogControls
                onAddFood={() => setIsModalOpen(true)}
                clipboardEntries={clipboardEntries}
                filteredEntries={filteredEntries}
                selectedEntries={selectedEntries}
                onCopyCurrentDay={handleCopyCurrentDay}
                onCopySelectedItems={handleCopySelectedItems}
                onPasteEntries={handlePasteEntries}
                onDeleteSelected={handleDeleteSelected}
                onCopyToToday={handleCopyToToday}
                isToday={isToday}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isTargetsModalOpen={isTargetsModalOpen}
                setIsTargetsModalOpen={setIsTargetsModalOpen}
                editModalEntry={editModalEntry}
                setEditModalEntry={setEditModalEntry}
                selectedDate={selectedDate}
                addFoodEntry={addFoodEntry}
                updateFoodEntry={updateFoodEntry}
                foodData={foodData}
                contextMenu={contextMenu}
                onEditEntry={handleEditEntry}
                onCopyEntries={handleCopyEntries}
                onDeleteSelectedEntries={handleDeleteSelectedEntries}
                showCopyToast={showCopyToast}
                targetInput={targetInput}
                onInputChange={handleInputChange}
                onSaveTargets={handleSaveTargets}
              />
            </Suspense>
            
            {/* Food entries table */}
            <div className="mb-6">
              <Suspense fallback={<div>Loading table...</div>}>
                <DynamicFoodLogTable 
                  foodData={foodData}
                  filteredEntries={filteredEntries}
                  selectedEntries={selectedEntries}
                  handleEntrySelect={handleEntrySelect}
                  removeFoodEntry={removeFoodEntry}
                  updateFoodEntry={updateFoodEntry}
                  onReorderEntries={handleReorderEntries}
                  onContextMenu={handleContextMenu}
                  setSelectedEntries={setSelectedEntries}
                  data-testid="food-log-table"
                />
              </Suspense>
            </div>
            
            <Suspense fallback={<div>Loading stats...</div>}>
              <FoodLogStats
                displayTotals={displayTotals}
                customGoals={customGoals}
                selectedEntries={selectedEntries}
                filteredEntries={filteredEntries}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}