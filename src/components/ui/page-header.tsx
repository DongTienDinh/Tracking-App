export function PageHeader({ title, subtitle, actions, today = false }: { title: string; subtitle?: string; actions?: React.ReactNode; today?: boolean }) {
  return (
    <header className="page-header">
      <div>
        <h1 className={`page-title${today ? " today-title" : ""}`}>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}
