// SelectionBar.jsx — floating toolbar shown over the canvas when something is selected.
// Replaces the "Delete selected" button that used to live in the top toolbar.

import { useStore } from './store';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Trash2 } from 'lucide-react';

const selector = (state) => ({
  selectedCount:
    state.nodes.filter((node) => node.selected).length +
    state.edges.filter((edge) => edge.selected).length,
  deleteSelected: state.deleteSelected,
});

export const SelectionBar = () => {
  const { selectedCount, deleteSelected } = useStore(selector);

  if (selectedCount === 0) return null;

  return (
    <div className="selection-bar pointer-events-auto absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border px-4 py-2 shadow-lg backdrop-blur">
      <Badge variant="secondary">{selectedCount} selected</Badge>
      <Button size="sm" variant="destructive" onClick={deleteSelected}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
      <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
        ⌫ / Del
      </kbd>
    </div>
  );
};
