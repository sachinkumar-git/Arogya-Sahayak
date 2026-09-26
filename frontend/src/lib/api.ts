let csrfToken = "";

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  errors: FieldErrors;

  constructor(status: number, data?: { error?: string; errors?: FieldErrors } | null) {
    super(data?.error || (status === 0 ? "You appear to be offline. Check your connection and try again." : "Something went wrong on our side. Please try again."));
    this.status = status;
    this.errors = data?.errors || {};
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
}

export const SESSION_EXPIRED_EVENT = "arogya:session-expired";

export async function api<T>(path: string, { method = "GET", body, form, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRF-Token"] = csrfToken;

  let payload: BodyInit | undefined;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, { method, headers, body: payload, credentials: "same-origin", signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    throw new ApiError(response.status, data);
  }
  return data as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

export const fieldErrors = (error: unknown): FieldErrors => (error instanceof ApiError ? error.errors : {});
