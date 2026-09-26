import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className }: VoiceInputButtonProps) {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const { supported, listening, start, stop } = useSpeechRecognition({
    locale,
    onResult: onTranscript,
    onError: () => toast({ description: t("voice.error"), variant: "destructive" }),
  });

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "outline"}
      size="sm"
      onClick={listening ? stop : start}
      aria-pressed={listening}
      className={cn(listening && "animate-pulse", className)}
    >
      {listening ? <MicOff aria-hidden /> : <Mic aria-hidden />}
      {listening ? t("voice.listening") : t("voice.start")}
    </Button>
  );
}
