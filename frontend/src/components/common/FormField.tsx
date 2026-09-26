import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

export function FormField({ label, error, hint, optional, className, children }: FormFieldProps) {
  const { t } = useLanguage();
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": Boolean(error) || undefined, "aria-describedby": describedBy })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="font-semibold">
        {label}
        {optional && <span className="ml-1 text-xs font-normal text-muted-foreground">({t("common.optional")})</span>}
      </Label>
      {control}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
