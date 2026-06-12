export default function Card({ title, subtitle, actions, footer, className = "", children }) {
  return (
    <div className={`card flex flex-col gap-3 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-medium">{title}</h3>}
            {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
      {footer && <div className="border-t border-accent/20 pt-2 text-sm">{footer}</div>}
    </div>
  );
}
