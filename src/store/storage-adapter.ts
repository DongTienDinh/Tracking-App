export const STORAGE_KEY = "app-tracking:v1";
export const STORAGE_ERROR_EVENT = "app-tracking:storage-error";

function reportStorageError() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT));
}

export const browserStorage = {
  getItem(name: string): string | null {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem(name); }
    catch (error) { reportStorageError(); throw error; }
  },
  setItem(name: string, value: string): void {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(name, value); }
    catch (error) { reportStorageError(); throw error; }
  },
  removeItem(name: string): void {
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(name); }
    catch (error) { reportStorageError(); throw error; }
  },
};
