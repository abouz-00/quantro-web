"use client";

import React from "react";
import { Header } from "./Header";
import { DateNavigation } from "./DateNavigation";

interface FoodLogHeaderProps {
  isMainMenuOpen: boolean;
  setIsMainMenuOpen: (open: boolean) => void;
  setIsTargetsModalOpen: (open: boolean) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function FoodLogHeader({
  isMainMenuOpen,
  setIsMainMenuOpen,
  setIsTargetsModalOpen,
  selectedDate,
  onDateChange
}: FoodLogHeaderProps) {
  return (
    <>
      <Header
        isMainMenuOpen={isMainMenuOpen}
        setIsMainMenuOpen={setIsMainMenuOpen}
        setIsTargetsModalOpen={setIsTargetsModalOpen}
        data-testid="header"
      />
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        data-testid="date-navigation"
      />
    </>
  );
}
