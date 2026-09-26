import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { errorMessage } from "@/lib/api";
import { ErrorState, ListSkeleton } from "./PageStates";

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryBoundary<T>({ query, loading, children }: QueryBoundaryProps<T>) {
  const { t } = useLanguage();
  if (query.isPending) return <>{loading ?? <ListSkeleton />}</>;
  if (query.isError) {
    return (
      <ErrorState
        title={t("errors.loadFailed")}
        message={errorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <>{children(query.data)}</>;
}
