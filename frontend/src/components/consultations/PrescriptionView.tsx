import { useLanguage } from "@/context/LanguageContext";
import { useFormatters } from "@/hooks/useFormatters";
import type { PrescriptionItem } from "@/types/api";

interface PrescriptionViewProps {
  diagnosis?: string;
  prescription: PrescriptionItem[];
  advice?: string;
  followUpDate?: string | null;
}

export function PrescriptionView({ diagnosis, prescription, advice, followUpDate }: PrescriptionViewProps) {
  const { t } = useLanguage();
  const format = useFormatters();

  return (
    <div className="space-y-4 text-sm">
      {diagnosis && (
        <section>
          <h4 className="mb-1 font-semibold">{t("consultation.diagnosis")}</h4>
          <p className="whitespace-pre-line">{diagnosis}</p>
        </section>
      )}

      <section>
        <h4 className="mb-2 font-semibold">{t("consultation.prescription")}</h4>
        {prescription.length === 0 ? (
          <p className="text-muted-foreground">{t("consultation.noPrescription")}</p>
        ) : (
          <>
            <ul className="space-y-2 sm:hidden print:hidden">
              {prescription.map((item, index) => (
                <li key={`${item.medicine}-${index}`} className="rounded-xl border p-3">
                  <p className="font-medium">{item.medicine}</p>
                  <dl className="mt-1 grid grid-cols-3 gap-2 text-xs">
                    {(["dosage", "frequency", "duration"] as const).map((field) => (
                      <div key={field}>
                        <dt className="text-muted-foreground">{t(`consultation.${field}`)}</dt>
                        <dd className="text-sm">{item[field] || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl border sm:block print:block">
              <table className="w-full min-w-[28rem] text-left">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t("consultation.medicine")}</th>
                    <th className="px-3 py-2 font-medium">{t("consultation.dosage")}</th>
                    <th className="px-3 py-2 font-medium">{t("consultation.frequency")}</th>
                    <th className="px-3 py-2 font-medium">{t("consultation.duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.map((item, index) => (
                    <tr key={`${item.medicine}-${index}`} className="border-t">
                      <td className="px-3 py-2 font-medium">{item.medicine}</td>
                      <td className="px-3 py-2">{item.dosage || "—"}</td>
                      <td className="px-3 py-2">{item.frequency || "—"}</td>
                      <td className="px-3 py-2">{item.duration || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {advice && (
        <section>
          <h4 className="mb-1 font-semibold">{t("consultation.advice")}</h4>
          <p className="whitespace-pre-line">{advice}</p>
        </section>
      )}

      {followUpDate && (
        <p>
          <span className="font-semibold">{t("consultation.followUp")}:</span> {format.date(followUpDate)}
        </p>
      )}
    </div>
  );
}
