import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RepeaterProps<T> = {
  items: T[];
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  onChange: (next: T[]) => void;
  createNew: () => T;
  addLabel?: string;
  emptyLabel?: string;
};

export function RepeaterField<T>({
  items,
  renderItem,
  onChange,
  createNew,
  addLabel = "Add item",
  emptyLabel = "No items yet.",
}: RepeaterProps<T>) {
  const update = (i: number, patch: Partial<T>) => {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...items, createNew()]);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                {renderItem(item, i, (patch) => update(i, patch))}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
