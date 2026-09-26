import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useSendMessage } from "@/hooks/api/useConsultations";
import { useFormatters } from "@/hooks/useFormatters";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Consultation } from "@/types/api";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

const MAX_LENGTH = 1000;

export function ChatPanel({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const format = useFormatters();
  const { toast } = useToast();
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const messages = consultation.messages ?? [];

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(
      { id: consultation._id, body },
      {
        onSuccess: () => setDraft(""),
        onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <ol ref={listRef} className="bg-dots max-h-80 min-h-[6rem] space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-secondary p-3" aria-live="polite">
        {messages.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">{t("consultation.noMessages")}</li>}
        {messages.map((message) => {
          const mine = message.sender._id === user._id;
          return (
            <li key={message._id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card shadow-sm",
                )}
              >
                <p className="whitespace-pre-line break-words">{message.body}</p>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {mine ? "" : `${message.sender.name} (${t(`roles.${message.sender.role}`)}) · `}
                {format.time(message.createdAt)}
              </span>
            </li>
          );
        })}
      </ol>

      {consultation.isOpen ? (
        <form onSubmit={submit} className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
            }}
            placeholder={t("consultation.messagePlaceholder")}
            aria-label={t("consultation.messagePlaceholder")}
            rows={2}
          />
          <div className="flex items-center justify-between gap-2">
            <VoiceInputButton onTranscript={(text) => setDraft((d) => `${d} ${text}`.trim().slice(0, MAX_LENGTH))} />
            <Button type="submit" size="sm" disabled={!draft.trim() || sendMessage.isPending} className="ml-auto">
              {sendMessage.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
              {t("consultation.send")}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("consultation.chatClosed")}</p>
      )}
    </div>
  );
}
