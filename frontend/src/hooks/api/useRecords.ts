import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HealthRecord, PatientSummary } from "@/types/api";
import { queryKeys } from "./keys";

interface RecordsResponse {
  records: HealthRecord[];
  latestVitals: HealthRecord | null;
}

export function useMyRecords() {
  return useQuery({ queryKey: queryKeys.records, queryFn: () => api<RecordsResponse>("/records") });
}

export function usePatientRecords(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patientRecords(patientId),
    queryFn: () => api<RecordsResponse & { patient: PatientSummary }>(`/patients/${patientId}/records`),
  });
}

function useRecordsMutation<TInput, TResult>(request: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export const useUploadRecord = () =>
  useRecordsMutation((form: FormData) => api<{ record: HealthRecord }>("/records", { method: "POST", form }));

export const useDeleteRecord = () => useRecordsMutation((id: string) => api(`/records/${id}`, { method: "DELETE" }));

export const recordFileUrl = (id: string, inline = false) => `/api/records/${id}/file${inline ? "?inline=1" : ""}`;
