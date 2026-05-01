"use client";

import Image from 'next/image';
import React, { useCallback, useState, useMemo, useRef } from "react";
import {
  type CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FoodTableProps, FoodEntry } from './types';
import { abbreviateUnit, capitalizeWords, formatNumber } from './utils';
import { MealSection } from './components';
import { useFoodTableDragDrop, useFoodTableState } from './hooks';
import { isSupplement } from './utils/supplementDetection';
import styles from './FoodLogTable.module.css';

// Add meal type order constant
const MEAL_TYPES: Array<FoodEntry['mealType']> = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

function DragOverlayRow({ item }: { item: FoodEntry }) {
  return (
    <div className={`${styles.foodTableRow} ${styles.dragOverlayRow} ${styles.draggingItem}`} role="presentation">
      <div className={styles.cellDescription}>
        <div className="flex items-center space-x-2">
          {isSupplement(item.description) ? (
            <Image
              src="/pill.svg"
              alt="pill"
              width={20}
              height={20}
              className="flex-shrink-0"
              aria-label="supplement pill"
            />
          ) : (
            <Image
              src="/toast.svg"
              alt="toast"
              width={20}
              height={20}
              className="flex-shrink-0"
              aria-label="food"
            />
          )}
          <span style={{ marginLeft: '16px', fontWeight: 400 }}>
            {capitalizeWords(item.description)}
          </span>
        </div>
      </div>
      <div className={styles.cellAmount}>
        {formatNumber(parseFloat(item.amount))} {abbreviateUnit(item.unit)}
      </div>
      <div className={styles.cellCalories}>
        <span>{formatNumber(item.calories)}</span>
        <span className="text-gray-600 ml-1">kcal</span>
      </div>
    </div>
  );
}

/**
 * Professional FoodLogTable Component
 * 
 * Architecture:
 * - Clean separation of concerns
 * - Proper event delegation without duplicate logic
 * - Type-safe event handling
 * - Professional design patterns
 */
export default function FoodLogTable({ 
  foodData, 
  filteredEntries, 
  selectedEntries, 
  handleEntrySelect,
  updateFoodEntry = () => {},
  onReorderEntries = () => {},
  onContextMenu
}: FoodTableProps) {
  // =====================
  // Hooks
  // =====================
  const {
    editingEntry,
    setEditingEntry,
    editAmount,
    setEditAmount,
    editUnit,
    setEditUnit
  } = useFoodTableState();

  const containerRef = useRef<HTMLDivElement>(null);

  // =====================
  // Collapse State (lifted from MealSection so SortableContext items stay in sync)
  // =====================
  const [collapsedMeals, setCollapsedMeals] = useState<Record<string, boolean>>({});

  // =====================
  // Professional Event Adapter Pattern
  // =====================
  
  /**
   * Pass selection handler directly without modification
   * Event is already compatible from child components
   */
  const adaptedSelectionHandler = useCallback((
    id: string,
    index: number, 
    event?: React.MouseEvent | React.KeyboardEvent | { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } | null
  ) => {
    handleEntrySelect(id, index, event);
  }, [handleEntrySelect]);

  const handleDragTargetChange = useCallback((nextDragOverTarget: string | null) => {
    if (!nextDragOverTarget) {
      return;
    }

    const mealType = nextDragOverTarget.replace('drop-', '');

    setCollapsedMeals((previousMeals) => {
      if (!previousMeals[mealType]) {
        return previousMeals;
      }

      return { ...previousMeals, [mealType]: false };
    });
  }, []);

  // =====================
  // Drag & Drop Setup
  // =====================
  const {
    currentEntries,
    activeId,
    dragOverTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useFoodTableDragDrop({
    filteredEntries,
    selectedEntries,
    onReorderEntries,
    updateFoodEntry,
    handleEntrySelect: adaptedSelectionHandler,
    onDragTargetChange: handleDragTargetChange,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drag on normal row clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleCollapse = useCallback((mealType: string) => {
    // Don't allow collapsing while dragging - this prevents items from disappearing
    if (!activeId) {
      setCollapsedMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
    }
  }, [activeId]);

  // =====================
  // Data Processing
  // =====================
  
  // Group entries by meal type
  const entriesByMealType = useMemo(() => {
    return MEAL_TYPES.reduce((acc, mealType) => {
      acc[mealType] = currentEntries.filter(entry => entry.mealType === mealType);
      return acc;
    }, {} as Record<FoodEntry['mealType'], FoodEntry[]>);
  }, [currentEntries]);

  // SortableContext items MUST include ALL items (including those in collapsed meals)
  // because collapsed meals still have DOM entries (just hidden by isCollapsed rendering)
  // If we exclude them here, drag-drop into collapsed meals breaks and items disappear
  const orderedItemIds = useMemo(() => {
    return MEAL_TYPES.flatMap((mealType) =>
      entriesByMealType[mealType].map((entry) => entry.id)
    );
  }, [entriesByMealType]);

  const lastMealTypeWithEntries = useMemo(() => {
    return MEAL_TYPES.slice().reverse().find(
      (mealType) => entriesByMealType[mealType] && entriesByMealType[mealType].length > 0
    );
  }, [entriesByMealType]);

  const activeEntry = useMemo(
    () => currentEntries.find((entry) => entry.id === activeId) ?? filteredEntries.find((entry) => entry.id === activeId) ?? null,
    [activeId, currentEntries, filteredEntries]
  );

  const collisionDetection = useMemo<CollisionDetection>(() => {
    return (args) => {
      const filteredDroppableContainers = args.droppableContainers.filter(
        (container) => container.id !== args.active.id
      );

      return closestCenter({
        ...args,
        droppableContainers: filteredDroppableContainers,
      });
    };
  }, []);

  const restrictToFoodTableBounds = useMemo<Modifier>(() => {
    return ({ draggingNodeRect, transform }) => {
      const containerElement = containerRef.current;
      const containerRect = containerElement?.getBoundingClientRect();
      const headerRects = Array.from(
        containerElement?.querySelectorAll<HTMLElement>('[data-meal-header]') ?? []
      ).map((header) => ({
        mealType: header.dataset.mealHeader,
        rect: header.getBoundingClientRect(),
      }));
      const breakfastHeaderRect = headerRects.find(({ mealType }) => mealType === 'breakfast')?.rect;

      if (!draggingNodeRect || !containerRect) {
        return transform;
      }

      let nextY = transform.y;
      const upperBoundary = breakfastHeaderRect?.bottom ?? containerRect.top;

      let nextTop = draggingNodeRect.top + nextY;
      let nextBottom = draggingNodeRect.bottom + nextY;

      if (nextTop < upperBoundary) {
        nextY += upperBoundary - nextTop;
        nextTop = draggingNodeRect.top + nextY;
        nextBottom = draggingNodeRect.bottom + nextY;
      }

      if (nextBottom > containerRect.bottom) {
        nextY -= nextBottom - containerRect.bottom;
        nextTop = draggingNodeRect.top + nextY;
        nextBottom = draggingNodeRect.bottom + nextY;
      }

      const intermediateHeaders = headerRects
        .filter(({ mealType }) => mealType !== 'breakfast')
        .sort((left, right) => left.rect.top - right.rect.top);

      if (transform.y > 0) {
        for (const { rect } of intermediateHeaders) {
          const overlapsHeader = nextTop < rect.bottom && nextBottom > rect.top;

          if (overlapsHeader) {
            nextY += rect.bottom - nextTop;
            nextTop = draggingNodeRect.top + nextY;
            nextBottom = draggingNodeRect.bottom + nextY;
          }
        }
      } else if (transform.y < 0) {
        for (const { rect } of intermediateHeaders.slice().reverse()) {
          const overlapsHeader = nextTop < rect.bottom && nextBottom > rect.top;

          if (overlapsHeader) {
            nextY -= nextBottom - rect.top;
            nextTop = draggingNodeRect.top + nextY;
            nextBottom = draggingNodeRect.bottom + nextY;
          }
        }
      }

      return {
        ...transform,
        y: nextY,
      };
    };
  }, []);

  const dndModifiers = useMemo(
    () => [restrictToVerticalAxis, restrictToFoodTableBounds],
    [restrictToFoodTableBounds]
  );

  const dndMeasuring = useMemo(
    () => ({ droppable: { strategy: MeasuringStrategy.BeforeDragging } }),
    []
  );

  // =====================
  // Render
  // =====================
  return (
    <div 
      ref={containerRef}
      className={`w-full overflow-x-auto ${styles.foodTableContainer} ${activeId ? styles.dragging : ''}`}
      style={{ cursor: activeId ? 'move' : 'default' }}
    >
      <DndContext 
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={dndModifiers}
        measuring={dndMeasuring}
      >
        <SortableContext 
          items={orderedItemIds}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {MEAL_TYPES.map((mealType, index) => {
              // If no meal types have entries, the last meal type in the array should be considered last
              const isLastSection = lastMealTypeWithEntries ? 
                mealType === lastMealTypeWithEntries : 
                index === MEAL_TYPES.length - 1;
              
              return (
                <MealSection
                  key={mealType}
                  mealType={mealType}
                  entries={entriesByMealType[mealType]}
                  foodData={currentEntries}
                  selectedEntries={selectedEntries}
                  handleEntrySelect={adaptedSelectionHandler}
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
                  dragOverTarget={dragOverTarget}
                  isLastSection={isLastSection}
                  isCollapsed={!!collapsedMeals[mealType]}
                  onToggleCollapse={() => toggleCollapse(mealType)}
                />
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeEntry ? <DragOverlayRow item={activeEntry} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
