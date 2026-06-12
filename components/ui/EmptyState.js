export default function EmptyState({ icon = "📭", title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border border-dashed border-accent-light px-6 py-10 text-center ${className}`}>
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      {title && <p className="font-medium">{title}</p>}
      {description && <p className="max-w-sm text-sm opacity-60">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
