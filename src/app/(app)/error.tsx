"use client";

import { useEffect } from "react";

export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div className="page"><section className="panel"><h1 className="page-title">Không thể mở màn hình</h1><p className="page-subtitle">Dữ liệu cục bộ vẫn được giữ nguyên. Bạn có thể thử tải lại phần này.</p><button className="button" type="button" onClick={reset} style={{ marginTop: 18 }}>Thử lại</button></section></div>;
}
