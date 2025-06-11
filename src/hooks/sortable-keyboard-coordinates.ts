
import { KeyboardCoordinateGetter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates as dndKitSortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Re-export the sortableKeyboardCoordinates function from @dnd-kit/sortable
export const sortableKeyboardCoordinates: KeyboardCoordinateGetter = dndKitSortableKeyboardCoordinates;
