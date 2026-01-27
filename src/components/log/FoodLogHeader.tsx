"use client";

import React from "react";
import { Header } from "./Header";

interface FoodLogHeaderProps {
  isMainMenuOpen: boolean;
  setIsMainMenuOpen: (open: boolean) => void;
  setIsTargetsModalOpen: (open: boolean) => void;
}

export default function FoodLogHeader({
  isMainMenuOpen,
  setIsMainMenuOpen,
  setIsTargetsModalOpen
}: FoodLogHeaderProps) {
  return (
    <Header
      isMainMenuOpen={isMainMenuOpen}
      setIsMainMenuOpen={setIsMainMenuOpen}
      setIsTargetsModalOpen={setIsTargetsModalOpen}
      data-testid="header"
    />
  );
}
