import { useState } from 'react';
import { normalizeUnit } from '../utils';

export function useFoodTableState() {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editUnit, setEditUnit] = useState<string>("");

  const startEditing = (entryId: string, amount: string, unit: string) => {
    setEditingEntry(entryId);
    setEditAmount(amount);
    setEditUnit(normalizeUnit(unit));
  };

  const stopEditing = () => {
    setEditingEntry(null);
    setEditAmount("");
    setEditUnit("");
  };

  const resetEditValues = (amount: string, unit: string) => {
    setEditAmount(amount);
    setEditUnit(normalizeUnit(unit));
  };

  return {
    editingEntry,
    setEditingEntry,
    editAmount,
    setEditAmount,
    editUnit,
    setEditUnit,
    startEditing,
    stopEditing,
    resetEditValues
  };
}
