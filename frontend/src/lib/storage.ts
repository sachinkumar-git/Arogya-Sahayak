export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};

export const safeRedirectPath = (path: unknown, fallback = "/dashboard") =>
  typeof path === "string" && /^\/(?![/\\])/.test(path) ? path : fallback;
