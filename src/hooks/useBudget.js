import { useMemo } from 'react';
import { calculateBudget } from '../utils/budgetUtils';

// Custom hook for budget calculations
export const useBudget = (cellLayers, fences) => {
  // Memoized budget calculation - only recalculates when cellLayers or fences change
  const budget = useMemo(() => {
    return calculateBudget(cellLayers, fences);
  }, [cellLayers, fences]);

  // Get budget item by type
  const getBudgetItem = (type) => {
    return budget.items[type] || null;
  };

  // Check if budget has any items
  const hasItems = Object.keys(budget.items).length > 0;

  return {
    budget,
    getBudgetItem,
    hasItems
  };
};
