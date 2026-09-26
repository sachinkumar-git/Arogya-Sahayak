import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/PageStates";
import { useLanguage } from "@/context/LanguageContext";
import type { HealthRecord, RecordType } from "@/types/api";
import { RecordItem } from "./RecordItem";

interface RecordListProps {
  records: HealthRecord[];
  deletableBy?: string;
}

export function RecordList({ records, deletableBy }: RecordListProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<RecordType | "all">("all");

  const types = useMemo(() => Array.from(new Set(records.map((r) => r.type))), [records]);
  const visible = filter === "all" ? records : records.filter((r) => r.type === filter);

  if (records.length === 0) {
    return <EmptyState icon={FileText} title={t("records.empty")} description={t("records.emptyHint")} />;
  }

  return (
    <div className="space-y-4">
      {types.length > 1 && (
        <div className="no-print flex flex-wrap gap-2" role="group" aria-label={t("records.type")}>
          {(["all", ...types] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? "default" : "outline"}
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
            >
              {type === "all" ? t("records.all") : t(`records.types.${type}`)}
            </Button>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {visible.map((record) => (
          <RecordItem key={record._id} record={record} canDelete={Boolean(deletableBy) && record.recordedBy?._id === deletableBy} />
        ))}
      </div>
    </div>
  );
}
