import { Link } from "react-router-dom";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses, type Tone } from "@/lib/tones";

interface ActionTileProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: Tone;
}

export function ActionTile({ to, icon: Icon, title, description, tone = "primary" }: ActionTileProps) {
  return (
    <Link
      to={to}
      className="health-card card-link group grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 !p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:!p-5"
    >
      <span
        className={cn(
          "icon-large transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100",
          toneClasses(tone),
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="min-w-0 sm:col-span-2 sm:row-start-2">
        <span className="block font-display font-semibold leading-snug">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{description}</span>
      </span>
      <ArrowUpRight
        className="h-5 w-5 text-muted-foreground transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:group-hover:transform-none sm:col-start-2 sm:row-start-1"
        aria-hidden
      />
    </Link>
  );
}
