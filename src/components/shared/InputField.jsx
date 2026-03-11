import { useId, useState } from "react";

const fieldBaseClassName =
  "w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const fieldClassNameByType = {
  input: `h-11 ${fieldBaseClassName}`,
  textarea: `${fieldBaseClassName} py-2.5`,
  select: `h-11 ${fieldBaseClassName}`,
};

const DEFAULT_TYPE_MESSAGES = {
  email: "Enter a valid email address.",
  number: "Enter a valid number.",
  tel: "Enter a valid phone number.",
  url: "Enter a valid URL.",
};

const DEFAULT_INPUT_MODE_BY_TYPE = {
  email: "email",
  number: "decimal",
  search: "search",
  tel: "tel",
  url: "url",
};

function getErrorMessage(fieldError) {
  if (!fieldError) return "";
  if (typeof fieldError === "string") return fieldError;
  if (typeof fieldError.message === "string") return fieldError.message;
  return "";
}

export default function InputField({
  as = "input",
  label,
  id: idProp,
  name,
  type = "text",
  errors,
  register,
  step,
  disabled = false,
  required = false,
  message = "This field is required",
  requiredMessage,
  labelClassName = "",
  inputClassName = "",
  min,
  max,
  value,
  placeholder = "",
  validate,
  validator,
  customValidator,
  pattern,
  patternMessage,
  error = "",
  hint,
  helperText,
  validationMessages = {},
  invalidMessage,
  validateOnChange = true,
  validateOnBlur = true,
  onValidationChange,
  containerClassName = "",
  fieldClassName = "",
  showRequiredMark = true,
  children,
  onChange,
  onBlur,
  onInvalid,
  ...props
}) {
  const Component = as;
  const generatedId = useId();
  const inputId = idProp || generatedId;
  const fieldName = name || idProp;
  const resolvedFieldClassName = fieldClassNameByType[as] || fieldClassNameByType.input;
  const [internalError, setInternalError] = useState("");
  const messageId = `${inputId}-message`;
  const resolvedHint = helperText || hint;
  const effectiveValidate = validate || validator || customValidator;
  const resolvedInputMode = props.inputMode || DEFAULT_INPUT_MODE_BY_TYPE[type];
  const resolvedAutoComplete = props.autoComplete ?? (
    type === "email"
      ? "email"
      : type === "url"
        ? "url"
        : type === "tel"
          ? "tel"
          : undefined
  );
  const externalError = getErrorMessage(error)
    || getErrorMessage(errors?.[fieldName])
    || getErrorMessage(errors?.[inputId]);

  const messageByValidity = {
    valueMissing: requiredMessage || validationMessages.valueMissing || message,
    typeMismatch: validationMessages.typeMismatch || invalidMessage || DEFAULT_TYPE_MESSAGES[type] || "",
    patternMismatch: validationMessages.patternMismatch || patternMessage || "",
    tooShort: validationMessages.tooShort || "",
    tooLong: validationMessages.tooLong || "",
    rangeUnderflow: validationMessages.rangeUnderflow || validationMessages.min || "",
    rangeOverflow: validationMessages.rangeOverflow || validationMessages.max || "",
    stepMismatch: validationMessages.stepMismatch || "",
    badInput: validationMessages.badInput || invalidMessage || DEFAULT_TYPE_MESSAGES[type] || "",
    customError: validationMessages.customError || "",
  };

  const registerOptions = {
    ...(required ? { required: requiredMessage || message } : {}),
    ...(pattern ? { pattern: { value: pattern instanceof RegExp ? pattern : new RegExp(pattern), message: patternMessage } } : {}),
    ...(min !== undefined ? { min: { value: min, message: validationMessages.min || validationMessages.rangeUnderflow } } : {}),
    ...(max !== undefined ? { max: { value: max, message: validationMessages.max || validationMessages.rangeOverflow } } : {}),
    ...(effectiveValidate ? { validate: effectiveValidate } : {}),
  };

  const registerProps = typeof register === "function" && fieldName
    ? register(fieldName, registerOptions)
    : {};
  const {
    ref: registerRef,
    onBlur: registerOnBlur,
    onChange: registerOnChange,
    name: registeredName,
    ...restRegisterProps
  } = registerProps;

  const resolveValidationMessage = (element) => {
    if (typeof effectiveValidate === "function" && !register) {
      const customMessage = effectiveValidate(element.value, element);
      element.setCustomValidity(typeof customMessage === "string" ? customMessage : "");
    } else {
      element.setCustomValidity("");
    }

    const validityChecks = [
      "valueMissing",
      "typeMismatch",
      "patternMismatch",
      "tooShort",
      "tooLong",
      "rangeUnderflow",
      "rangeOverflow",
      "stepMismatch",
      "badInput",
      "customError",
    ];

    for (const validityKey of validityChecks) {
      if (element.validity[validityKey] && messageByValidity[validityKey]) {
        return messageByValidity[validityKey];
      }
    }

    return element.validationMessage;
  };

  const syncValidationState = (element) => {
    const nextMessage = resolveValidationMessage(element);
    const nextError = element.validity.valid ? "" : nextMessage;
    setInternalError(nextError);
    onValidationChange?.({
      element,
      isValid: element.validity.valid,
      message: nextError,
      value: element.value,
    });
  };

  const handleChange = (event) => {
    if (validateOnChange && (internalError || event.currentTarget.value !== "")) {
      syncValidationState(event.currentTarget);
    }
    registerOnChange?.(event);
    onChange?.(event);
  };

  const handleBlur = (event) => {
    if (validateOnBlur) {
      syncValidationState(event.currentTarget);
    }
    registerOnBlur?.(event);
    onBlur?.(event);
  };

  const handleInvalid = (event) => {
    syncValidationState(event.currentTarget);
    onInvalid?.(event);
  };

  const displayMessage = externalError || internalError;
  const describedBy = displayMessage ? messageId : resolvedHint ? messageId : undefined;
  const validationClassName = displayMessage
    ? "border-danger text-text-primary focus:border-danger focus:ring-danger/20"
    : "";

  return (
    <label className={`block ${containerClassName}`}>
      {label ? (
        <span className={`mb-1 block text-sm font-medium text-text-secondary ${labelClassName}`.trim()}>
          {label}
          {required && showRequiredMark ? <span className="ml-1 text-danger">*</span> : null}
        </span>
      ) : null}
      <Component
        {...props}
        {...restRegisterProps}
        id={inputId}
        name={registeredName || fieldName}
        type={as === "input" ? type : undefined}
        value={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={displayMessage ? "true" : "false"}
        aria-describedby={describedBy}
        className={`${resolvedFieldClassName} ${validationClassName} ${fieldClassName} ${inputClassName}`.trim()}
        inputMode={resolvedInputMode}
        autoComplete={resolvedAutoComplete}
        onChange={handleChange}
        onBlur={handleBlur}
        onInvalid={handleInvalid}
        ref={registerRef}
      >
        {children}
      </Component>
      {displayMessage ? (
        <p id={messageId} className="mt-1 text-sm text-danger">
          {displayMessage}
        </p>
      ) : resolvedHint ? (
        <p id={messageId} className="mt-1 text-sm text-text-muted">
          {resolvedHint}
        </p>
      ) : null}
    </label>
  );
}
