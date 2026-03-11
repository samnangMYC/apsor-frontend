import { useEffect, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  error = "",
  required = false,
  requiredMessage = "This field is required.",
  validator,
  validateOnChange = true,
  validateOnBlur = true,
  onValidationChange,
  showToggle = false,
  isVisible = false,
  onToggleVisibility,
  toggleLabels,
  as = "input",
  rows = 4,
  children,
  max,
  min,
}) {
  const Component = as;
  const inputId = useId();
  const [internalError, setInternalError] = useState("");
  const resolvedType = showToggle ? (isVisible ? "text" : "password") : type;
  const paddingClassName = Icon ? "pl-9" : "pl-3";
  const trailingClassName = showToggle ? "pr-11" : "pr-3";
  const displayError = error || internalError;
  const fieldClassName = [
    as === "textarea" ? "w-full rounded-lg border bg-bg-app px-3 py-2.5" : "h-11 w-full rounded-lg border bg-bg-app",
    "text-sm text-text-primary outline-none transition",
    paddingClassName,
    trailingClassName,
    displayError
      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
      : "border-border focus:border-brand focus:ring-2 focus:ring-brand/20",
  ].join(" ");

  useEffect(() => {
    if (error) {
      setInternalError("");
    }
  }, [error]);

  const runValidation = (nextValue) => {
    const safeValue = typeof nextValue === "string" ? nextValue : String(nextValue ?? "");

    if (required && !safeValue.trim()) {
      return requiredMessage;
    }

    if (typeof validator === "function") {
      return validator(safeValue) || "";
    }

    return "";
  };

  const syncValidation = (nextValue) => {
    const message = runValidation(nextValue);
    setInternalError(message);
    onValidationChange?.({
      name,
      value: nextValue,
      isValid: !message,
      message,
    });
    return message;
  };

  const handleChange = (event) => {
    if (validateOnChange) {
      syncValidation(event.target.value);
    }
    onChange?.(event);
  };

  const handleBlur = (event) => {
    if (validateOnBlur) {
      syncValidation(event.target.value);
    }
  };

  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
          {label}
        </span>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        ) : null}
        <Component
          id={inputId}
          name={name}
          type={as === "input" ? resolvedType : undefined}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={as === "textarea" ? rows : undefined}
          max={max}
          min={min}
          required={required}
          aria-invalid={displayError ? "true" : "false"}
          aria-describedby={displayError ? `${inputId}-error` : undefined}
          className={fieldClassName}
        >
          {children}
        </Component>
        {showToggle ? (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
            aria-label={isVisible ? toggleLabels?.hide : toggleLabels?.show}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {displayError ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
          {displayError}
        </p>
      ) : null}
    </label>
  );
}
