import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, hint, id, required = false, className = "", ...rest },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
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
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className="input-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={error ? { borderColor: "var(--danger, #ef4444)" } : undefined}
        {...rest}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs"
          style={{ color: "var(--danger, #ef4444)" }}
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          className="text-xs opacity-60"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
