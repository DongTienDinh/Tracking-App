import Link from "next/link";

export default function NotFound() {
  return <main className="page"><section className="panel"><h1 className="page-title">Không tìm thấy màn hình</h1><p className="page-subtitle">Đường dẫn này không thuộc App Tracking V1.</p><Link className="button" href="/today" style={{ marginTop: 18 }}>Về Hôm nay</Link></section></main>;
}
