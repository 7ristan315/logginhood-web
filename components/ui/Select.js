import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { label, error, hint, id, required = false, options = [], placeholder, className = "", children, ...rest },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  // options can be flat [{value, label}] or grouped [{label, options: [{value, label}]}]
  function renderOptions() {
    if (children) return children;
    return options.map((opt) => {
      if (opt.options) {
        // optgroup
        return (
          <optgroup key={opt.label} label={opt.label}>
            {opt.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        );
      }
      return (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      );
    });
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: "var(--accent)", marginLeft: 2 }}>
              *
            </span>
          )}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        className="input-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={error ? { borderColor: "var(--danger, #ef4444)" } : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {renderOptions()}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="text-xs"
          style={{ color: "var(--danger, #ef4444)" }}
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p
          id={`${selectId}-hint`}
          className="text-xs opacity-60"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

export default Select;
