import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Arogya Sahayak` : "Arogya Sahayak · Rural Telemedicine";
  }, [title]);
}
