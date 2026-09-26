import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  multiple?: boolean;
  children: ReactNode;
  className?: string;
}

export function ChoiceCard({ selected, onSelect, disabled, multiple, children, className }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative w-full rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition-[border-color,background-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-primary bg-primary-light/70 shadow-sm ring-1 ring-primary" : "hover:border-primary/40 hover:bg-primary-light/25 hover:shadow-sm",
        className,
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm animate-in zoom-in-50 duration-150">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      )}
      {children}
    </button>
  );
}
