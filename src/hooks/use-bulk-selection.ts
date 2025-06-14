
import { useState, useCallback } from 'react';

export function useBulkSelection(items: any[] = []) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const selectItem = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      if (selected) {
        return [...prev, itemId];
      } else {
        return prev.filter(id => id !== itemId);
      }
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = items.map(item => item.id);
    setSelectedItems(allIds);
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isAllSelected = selectedItems.length > 0 && selectedItems.length === items.length;
  const hasSelection = selectedItems.length > 0;

  return {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    selectedCount: selectedItems.length
  };
}
