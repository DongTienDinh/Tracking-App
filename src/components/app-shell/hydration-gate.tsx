"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { STORAGE_ERROR_EVENT } from "@/store/storage-adapter";

function LoadingShell() {
  return (
    <main className="app-main" aria-busy="true" aria-label="Đang tải dữ liệu cục bộ">
      <div className="page stack">
        <div className="skeleton title" />
        <div className="kpi-strip">
          {[0, 1, 2, 3].map((item) => <div className="kpi stack" key={item}><div className="skeleton line" /><div className="skeleton title" /></div>)}
        </div>
        <div className="skeleton panel" />
      </div>
    </main>
  );
}

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const handleStorageError = () => useAppStore.setState({ storageError: "Không thể ghi dữ liệu cục bộ. Hãy export backup ngay nếu có thể." });
    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError);
    void Promise.resolve(useAppStore.persist.rehydrate()).then(() => {
      useAppStore.setState({ hasHydrated: true });
      setHydrated(true);
    }).catch(() => {
      useAppStore.setState({ storageError: "Không thể đọc dữ liệu cục bộ.", hasHydrated: true });
      setHydrated(true);
    });
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError);
  }, []);
  return hydrated ? children : <LoadingShell />;
}
