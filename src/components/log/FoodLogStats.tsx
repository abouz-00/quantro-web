"use client";

import React from "react";
import { EnergySummary, MicronutrientsSection } from "../food-log/core";
import { FoodEntry, Nutrients } from "../../types/food";

interface FoodLogStatsProps {
  displayTotals: Nutrients;
  customGoals: Nutrients;
  selectedEntries: string[];
  filteredEntries: FoodEntry[];
}

export default function FoodLogStats({
  displayTotals,
  customGoals,
  selectedEntries,
  filteredEntries
}: FoodLogStatsProps) {
  const entries = selectedEntries.length > 0
    ? filteredEntries.filter(entry => selectedEntries.includes(entry.id))
    : filteredEntries;

  return (
    <>
      {/* Summary */}
      <div className="mb-6">
        <EnergySummary
          totals={displayTotals}
          customGoals={customGoals}
          selectedEntryCount={selectedEntries.length}
          entries={entries}
          data-testid="energy-summary"
        />
      </div>

      {/* Micronutrients */}
      <div className="mb-6">
        <MicronutrientsSection
          entries={entries}
          data-testid="micronutrients-section"
        />
      </div>
    </>
  );
}
