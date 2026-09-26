import { cn } from "@/lib/utils";

export function PulseLine({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 600 80" fill="none" preserveAspectRatio="none" aria-hidden className={cn("pointer-events-none", className)}>
      <path
        d="M0 40h170l14-18 16 36 22-64 22 82 16-50 12 14h328"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={animate ? { strokeDasharray: 700, ["--path-length" as string]: 700, animation: "draw 1.6s var(--ease-out) both" } : undefined}
      />
    </svg>
  );
}
