import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useUploadRecord } from "@/hooks/api/useRecords";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, fieldErrors } from "@/lib/api";
import { formatFileSize, toDateInput } from "@/lib/format";
import type { RecordType } from "@/types/api";

const EMPTY = { type: "lab_report" as RecordType, title: "", notes: "", recordedAt: "" };

export function UploadRecordDialog() {
  const { t } = useLanguage();
  const { meta } = useSession();
  const { toast } = useToast();
  const upload = useUploadRecord();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const maxMb = meta.maxUploadBytes / (1024 * 1024);
  const errors = fieldErrors(upload.error);

  const reset = () => {
    setForm(EMPTY);
    setFile(null);
    setFileError("");
    upload.reset();
  };

  const chooseFile = (input: HTMLInputElement) => {
    let chosen = input.files?.[0] ?? null;
    setFileError("");
    if (chosen && !meta.uploadMimeTypes.includes(chosen.type)) {
      setFileError(t("records.fileType"));
      chosen = null;
    } else if (chosen && chosen.size > meta.maxUploadBytes) {
      setFileError(t("records.fileTooLarge", { size: maxMb }));
      chosen = null;
    }
    if (!chosen) input.value = "";
    setFile(chosen);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData();
    data.append("type", form.type);
    data.append("title", form.title);
    data.append("notes", form.notes);
    if (form.recordedAt) data.append("recordedAt", new Date(`${form.recordedAt}T12:00:00`).toISOString());
    if (file) data.append("file", file);

    upload.mutate(data, {
      onSuccess: () => {
        toast({ description: t("records.added") });
        setOpen(false);
        reset();
      },
      onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (upload.isPending) return;
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload aria-hidden />
          {t("records.upload")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("records.uploadTitle")}</DialogTitle>
            <DialogDescription>{t("records.uploadDesc", { size: maxMb })}</DialogDescription>
          </DialogHeader>

          <FormField label={t("records.type")} error={errors.type}>
            <Select value={form.type} onValueChange={(type) => setForm((f) => ({ ...f, type: type as RecordType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meta.uploadableRecordTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`records.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={t("records.recordTitle")} error={errors.title}>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t("records.recordTitlePlaceholder")}
              maxLength={120}
              required
            />
          </FormField>

          <FormField label={t("records.date")} optional error={errors.recordedAt}>
            <Input
              type="date"
              value={form.recordedAt}
              max={toDateInput(new Date())}
              onChange={(e) => setForm((f) => ({ ...f, recordedAt: e.target.value }))}
            />
          </FormField>

          <FormField
            label={t("records.file")}
            optional
            error={fileError || errors.file}
            hint={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
          >
            <Input type="file" accept={meta.uploadMimeTypes.join(",")} onChange={(e) => chooseFile(e.target)} />
          </FormField>

          <FormField label={t("records.notes")} optional error={errors.notes}>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} maxLength={2000} />
          </FormField>

          <DialogFooter>
            <Button type="submit" disabled={upload.isPending || !form.title.trim()}>
              {upload.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
