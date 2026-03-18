import { useMemo } from "react";
import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;

function getPasswordValidationMessage(value, message) {
  if (!value) {
    return "";
  }

  if (value.length < 8 || value.length > 128) {
    return message;
  }

  if (!PASSWORD_PATTERN.test(value)) {
    return message;
  }

  return "";
}

export default function UserFormModal({
  draft,
  mode = "create",
  labels,
  statusOptions,
  errorMessage = "",
  isSubmitting = false,
  onClose,
  onSubmit,
  onFieldUpdate,
}) {
  if (!draft) return null;
  const isEditMode = mode === "edit";
  const modalTitle = isEditMode ? labels.editUser : labels.addUser;
  const submitLabel = isEditMode ? labels.update : labels.create;
  const newPasswordError = useMemo(
    () => getPasswordValidationMessage(draft.newPassword || "", labels.passwordValidationMessage),
    [draft.newPassword, labels.passwordValidationMessage],
  );
  const isSubmitDisabled = isSubmitting || Boolean(newPasswordError);
  const resolvedStatusOptions = statusOptions || [
    { value: "ACTIVE", label: labels.statusActive },
    { value: "SUSPENDED", label: labels.statusSuspended },
    { value: "DELETED", label: labels.statusDeleted },
  ];

  return (
    <Modal
      open={Boolean(draft)}
      title={modalTitle}
      description={labels.users}
      closeLabel={labels.close}
      onClose={onClose}
      widthClassName="max-w-2xl"
      bodyClassName="grid gap-4 px-5 py-5 md:grid-cols-2"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-bg-surface px-4 text-sm font-medium text-text-secondary transition hover:cursor-pointer hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {labels.close}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/55"
          >
            {submitLabel}
          </button>
        </>
      )}
    >
      <InputField
        label={labels.username}
        type="text"
        value={draft.username}
        onChange={(event) => onFieldUpdate("username", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        label={labels.email}
        type="email"
        value={draft.email}
        onChange={(event) => onFieldUpdate("email", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        label={labels.firstName}
        type="text"
        value={draft.firstName}
        onChange={(event) => onFieldUpdate("firstName", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        label={labels.lastName}
        type="text"
        value={draft.lastName}
        onChange={(event) => onFieldUpdate("lastName", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        as="select"
        label={labels.userType}
        value={draft.userType}
        onChange={(event) => onFieldUpdate("userType", event.target.value)}
      >
        <option value="CUSTOMER">{labels.userTypeCustomer}</option>
        <option value="PROVIDER">{labels.userTypeProvider}</option>
        <option value="ADMIN">{labels.userTypeAdmin}</option>
      </InputField>
      <InputField
        as="select"
        label={labels.status}
        value={draft.status}
        onChange={(event) => onFieldUpdate("status", event.target.value)}
      >
        {resolvedStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </InputField>
      <InputField
        label={labels.phoneNumber}
        type="tel"
        value={draft.phoneNumber}
        onChange={(event) => onFieldUpdate("phoneNumber", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      {isEditMode ? (
        <InputField
          label={labels.newPassword}
          type="text"
          value={draft.newPassword || ""}
          onChange={(event) => onFieldUpdate("newPassword", event.target.value)}
          error={newPasswordError}
          helperText={labels.newPasswordHint}
        />
      ) : null}
      {!isEditMode ? (
        <InputField
          label={labels.temporaryPassword}
          type="text"
          value={draft.temporaryPassword || ""}
          onChange={(event) => onFieldUpdate("temporaryPassword", event.target.value)}
          required
          requiredMessage={labels.validationRequired}
        />
      ) : null}
      {errorMessage ? (
        <div className="md:col-span-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}
    </Modal>
  );
}
