import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Consultation, ConsultationMode, DoctorSummary, PatientSummary, Priority, PrescriptionItem, Vitals } from "@/types/api";
import { queryKeys } from "./keys";

const OPEN_POLL_MS = 10_000;

type ConsultationResponse = { consultation: Consultation };

export function useConsultations(scope: "active" | "past" | "all") {
  return useQuery({
    queryKey: queryKeys.consultations(scope),
    queryFn: () => api<{ consultations: Consultation[] }>(`/consultations?scope=${scope}`).then((r) => r.consultations),
    refetchInterval: scope === "active" ? OPEN_POLL_MS * 2 : false,
  });
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: queryKeys.consultation(id),
    queryFn: () => api<ConsultationResponse>(`/consultations/${id}`).then((r) => r.consultation),
    refetchInterval: (query) => (query.state.data?.isOpen ? OPEN_POLL_MS : false),
  });
}

function useConsultationMutation<TInput>(request: (input: TInput) => Promise<ConsultationResponse>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: ({ consultation }) => {
      queryClient.setQueryData(queryKeys.consultation(consultation._id), consultation);
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.records });
    },
  });
}

export interface NewConsultationInput {
  patientId?: string;
  doctorId?: string | null;
  specialty: string;
  mode: ConsultationMode;
  priority: Priority;
  complaint: string;
  symptoms?: string;
  scheduledAt?: string | null;
  vitals?: Vitals;
}

export const useCreateConsultation = () =>
  useConsultationMutation((input: NewConsultationInput) => api<ConsultationResponse>("/consultations", { method: "POST", body: input }));

const action = (id: string, name: string, body?: unknown) =>
  api<ConsultationResponse>(`/consultations/${id}/${name}`, { method: "PATCH", body });

export const useAcceptConsultation = () => useConsultationMutation((id: string) => action(id, "accept"));
export const useStartConsultation = () => useConsultationMutation((id: string) => action(id, "start"));
export const useCancelConsultation = () =>
  useConsultationMutation(({ id, reason }: { id: string; reason?: string }) => action(id, "cancel", { reason }));
export const useRecordVitals = () =>
  useConsultationMutation(({ id, vitals }: { id: string; vitals: Vitals }) => action(id, "vitals", { vitals }));

export interface CompleteInput {
  diagnosis: string;
  prescription: PrescriptionItem[];
  advice?: string;
  followUpDate?: string | null;
}

export const useCompleteConsultation = () =>
  useConsultationMutation(({ id, ...input }: CompleteInput & { id: string }) => action(id, "complete", input));

export const useSendMessage = () =>
  useConsultationMutation(({ id, body }: { id: string; body: string }) =>
    api<ConsultationResponse>(`/consultations/${id}/messages`, { method: "POST", body: { body } }),
  );

export function useDoctors(specialty?: string) {
  return useQuery({
    queryKey: queryKeys.doctors(specialty),
    queryFn: () => api<{ doctors: DoctorSummary[] }>(`/doctors?specialty=${specialty ?? ""}`).then((r) => r.doctors),
    enabled: Boolean(specialty),
  });
}

export function lookupPatient(query: string) {
  return api<{ patient: PatientSummary | null }>(`/patients/lookup?q=${encodeURIComponent(query)}`).then((r) => r.patient);
}
