import { useId } from "react";
import SharedInputField from "../../components/shared/InputField";
import AdminSelect from "./AdminSelect";

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error.message === "string") return error.message;
  return "";
}

export default function InputField({
  as = "input",
  label,
  id: idProp,
  required = false,
  showRequiredMark = true,
  helperText,
  hint,
  error,
  containerClassName = "",
  labelClassName = "",
  children,
  ...props
}) {
  const generatedId = useId();
  const inputId = idProp || generatedId;

  if (as !== "select") {
    return (
      <SharedInputField
        as={as}
        label={label}
        id={inputId}
        required={required}
        showRequiredMark={showRequiredMark}
        helperText={helperText}
        hint={hint}
        error={error}
        containerClassName={containerClassName}
        labelClassName={labelClassName}
        {...props}
      >
        {children}
      </SharedInputField>
    );
  }

  const displayMessage = getErrorMessage(error);
  const describedBy = displayMessage || helperText || hint ? `${inputId}-message` : undefined;

  return (
    <label className={`block ${containerClassName}`.trim()}>
      {label ? (
        <span className={`mb-1 block text-sm font-medium text-text-secondary ${labelClassName}`.trim()}>
          {label}
          {required && showRequiredMark ? <span className="ml-1 text-danger">*</span> : null}
        </span>
      ) : null}

      <AdminSelect
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={displayMessage ? "true" : "false"}
        className={displayMessage ? "border-danger focus:border-danger focus:ring-danger/20" : ""}
        {...props}
      >
        {children}
      </AdminSelect>

      {displayMessage ? (
        <p id={describedBy} className="mt-1 text-sm text-danger">
          {displayMessage}
        </p>
      ) : helperText || hint ? (
        <p id={describedBy} className="mt-1 text-sm text-text-muted">
          {helperText || hint}
        </p>
      ) : null}
    </label>
  );
}
