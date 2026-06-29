import { Lock, Unlock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function SlugInput({
  value,
  onChange,
  sourceValue,
  locked,
  onLockChange,
  placeholder = "auto-from-name",
}: {
  value: string;
  onChange: (next: string) => void;
  sourceValue: string;
  locked: boolean;
  onLockChange: (next: boolean) => void;
  placeholder?: string;
}) {
  const lastSource = useRef(sourceValue);
  useEffect(() => {
    if (locked && sourceValue !== lastSource.current) {
      onChange(slugify(sourceValue));
      lastSource.current = sourceValue;
    }
  }, [sourceValue, locked, onChange]);

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(slugify(e.target.value))}
        placeholder={placeholder}
        disabled={locked}
        className="font-mono text-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onLockChange(!locked)}
        title={locked ? "Unlock to edit manually" : "Lock to auto-generate"}
      >
        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Button>
    </div>
  );
}
