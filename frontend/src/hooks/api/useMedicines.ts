import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Medicine, PharmacyStock } from "@/types/api";
import { queryKeys } from "./keys";

export function useMedicineSearch(query: string) {
  return useQuery<Medicine[]>({
    queryKey: queryKeys.medicines(query),
    queryFn: ({ signal }) =>
      api<{ medicines: Medicine[] }>(`/medicines?q=${encodeURIComponent(query)}`, { signal }).then((r) => r.medicines),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useMedicineAvailability(id: string | null) {
  return useQuery({
    queryKey: queryKeys.medicine(id ?? ""),
    queryFn: () => api<{ medicine: Medicine; pharmacies: PharmacyStock[] }>(`/medicines/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
