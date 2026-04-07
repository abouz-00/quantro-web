"use client";

import React, { useState, useCallback, Suspense } from "react";
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
import { FoodLogService } from "../../services/foodLogService";
import { UndoDeleteToast } from "./UndoDeleteToast";

// Dynamic imports for better performance
const FoodLogHeader = dynamic(() => import('./FoodLogHeader'));
const DateNavigation = dynamic(() => import('./DateNavigation').then(mod => ({ default: mod.DateNavigation })));
const FoodLogStats = dynamic(() => import('./FoodLogStats'));
const FoodLogControls = dynamic(() => import('./FoodLogControls'));
const DynamicFoodLogTable = dynamic(() => import('../food-log').then(mod => mod.FoodLogTable));
const DebugPanel = dynamic(() => import('../debug/DebugPanel'), { ssr: false });

export default function LogPage() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(false);
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState<boolean>(false);
  const [editModalEntry, setEditModalEntry] = useState<FoodEntry | null>(null);

  // Undo delete state
  const [deletedEntries, setDeletedEntries] = useState<FoodEntry[]>([]);
  const [showUndoToast, setShowUndoToast] = useState(false);

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
    isLoaded,
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

  const handleCopyPreviousDay = async () => {
    try {
      const prevDate = new Date(selectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const year = prevDate.getFullYear();
      const month = String(prevDate.getMonth() + 1).padStart(2, '0');
      const day = String(prevDate.getDate()).padStart(2, '0');
      const prevDateStr = `${year}-${month}-${day}`;

      const previousEntries = await FoodLogService.loadFoodData(prevDateStr);
      if (previousEntries.length === 0) return;

      const copyPromises = previousEntries.map((entry, index) => {
        const newEntry: FoodEntry = {
          ...entry,
          id: generateEntryId(),
          date: selectedDate.toISOString(),
          orderIndex: index
        };
        return addFoodEntry(newEntry);
      });
      await Promise.all(copyPromises);
    } catch (error) {
      console.error('Error copying previous day entries:', error);
    }
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
    const idsToDelete = selectedEntries.length > 0 
      ? selectedEntries
      : contextMenu.targetEntryId 
        ? [contextMenu.targetEntryId]
        : [];
    
    const entriesToDelete = foodData.filter(entry => idsToDelete.includes(entry.id));
    if (entriesToDelete.length === 0) { closeContextMenu(); return; }

    setDeletedEntries(entriesToDelete);
    setShowUndoToast(true);
    idsToDelete.forEach(id => removeFoodEntry(id));
    closeContextMenu();
  };

  const handleDeleteSelected = () => {
    if (selectedEntries.length === 0) return;
    const entriesToDelete = foodData.filter(entry => selectedEntries.includes(entry.id));
    setDeletedEntries(entriesToDelete);
    setShowUndoToast(true);
    selectedEntries.forEach(id => removeFoodEntry(id));
  };

  const handleUndoDelete = useCallback(() => {
    deletedEntries.forEach(entry => {
      addFoodEntry({ ...entry, id: generateEntryId() }, new Date(entry.date));
    });
    setShowUndoToast(false);
    setDeletedEntries([]);
  }, [deletedEntries, addFoodEntry]);

  const handleDismissUndo = useCallback(() => {
    setShowUndoToast(false);
    setDeletedEntries([]);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAddFood: () => setIsModalOpen(true),
    onNextDay: goToNextDay,
    onPreviousDay: goToPreviousDay,
    onGoToToday: goToToday,
    onCopy: selectedEntries.length > 0 ? handleCopySelectedItems : undefined,
    onPaste: clipboardEntries.length > 0 ? handlePasteEntries : undefined,
    onDelete: selectedEntries.length > 0 ? handleDeleteSelected : undefined
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-page">
      {/* Debug Panel - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      )}
      
      {/* Fixed Header - only the purple bar */}
      <div className="flex-shrink-0 relative z-[100]">
        <Suspense fallback={<div className="w-full h-16 bg-primary/80 rounded-b-3xl animate-pulse" />}>
          <FoodLogHeader
            isMainMenuOpen={isMainMenuOpen}
            setIsMainMenuOpen={setIsMainMenuOpen}
            setIsTargetsModalOpen={setIsTargetsModalOpen}
          />
        </Suspense>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Date Navigation - scrolls with content */}
        <Suspense fallback={null}>
          <DateNavigation
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </Suspense>
        {/* Main Content Area */}
        <div 
          className="bg-page"
          style={{ minWidth: 0 }}
        >
          <div className="container mx-auto px-4 py-8 pb-40">
            <Suspense fallback={<div className="flex justify-end mb-6"><div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" /></div>}>
              <FoodLogControls
                onAddFood={() => setIsModalOpen(true)}
                clipboardEntries={clipboardEntries}
                filteredEntries={filteredEntries}
                selectedEntries={selectedEntries}
                onCopyPreviousDay={handleCopyPreviousDay}
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
              {!isLoaded ? (
                <div className="flex items-center justify-center py-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Loading...</span>
                  </div>
                </div>
              ) : (
              <Suspense fallback={
                <div className="space-y-1 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-9 bg-gray-300 rounded-t-lg" />
                      <div className="space-y-px">
                        {[...Array(2)].map((_, j) => <div key={j} className="h-10 bg-gray-100" />)}
                      </div>
                    </div>
                  ))}
                </div>
              }>
                <div className="animate-content-fade">
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
                </div>
              </Suspense>
              )}
            </div>
            
            <Suspense fallback={
              <div className="space-y-6 animate-pulse">
                <div className="bg-white rounded-lg p-5 shadow-lg">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                  <div className="flex space-x-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="flex-1 h-36 bg-gray-100 rounded-lg" />)}
                  </div>
                </div>
              </div>
            }>
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

      <UndoDeleteToast
        show={showUndoToast}
        itemCount={deletedEntries.length}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissUndo}
      />
    </div>
  );
}