import { MessageCircle, Phone, Video, type LucideProps } from "lucide-react";
import type { ConsultationMode } from "@/types/api";

const ICONS = { video: Video, audio: Phone, chat: MessageCircle } as const;

export function ModeIcon({ mode, ...props }: { mode: ConsultationMode } & LucideProps) {
  const Icon = ICONS[mode];
  return <Icon aria-hidden {...props} />;
}
