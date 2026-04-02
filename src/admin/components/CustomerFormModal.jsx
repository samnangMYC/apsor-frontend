import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

export default function CustomerFormModal({
  draft,
  userOptions = [],
  isUserSearchLoading = false,
  mode = "create",
  labels,
  errorMessage = "",
  isSubmitting = false,
  onClose,
  onSubmit,
  onFieldUpdate,
}) {
  if (!draft) return null;
  const isEditMode = mode === "edit";

  return (
    <Modal
      open={Boolean(draft)}
      title={isEditMode ? labels.editCustomer : labels.addCustomer}
      description={labels.customerManagement}
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
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/55"
          >
            {isEditMode ? labels.update : labels.create}
          </button>
        </>
      )}
    >
      {isEditMode ? (
        <div className="md:col-span-2">
          <InputField
            label={labels.email}
            type="email"
            value={draft.userEmailSearch}
            disabled
          />
        </div>
      ) : (
        <>
          <InputField
            label={labels.email}
            type="email"
            value={draft.userEmailSearch}
            onChange={(event) => onFieldUpdate("userEmailSearch", event.target.value)}
            placeholder={labels.emailSearchPlaceholder}
            required
            requiredMessage={labels.validationRequired}
          />

          <div className="rounded-xl border border-border bg-bg-subtle/40 px-3 py-3 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              {labels.matchingUsers}
            </p>
            <div className="mt-2 space-y-2">
              {isUserSearchLoading ? (
                <p className="text-sm text-text-muted">{labels.searching}</p>
              ) : userOptions.length ? (
                userOptions.map((user) => {
                  const isSelected = Number(draft.userId) === Number(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onFieldUpdate("selectedUser", user)}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                        isSelected
                          ? "border-brand bg-brand-soft/40 text-brand"
                          : "border-border bg-bg-surface text-text-primary hover:border-brand/35"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {user.email || labels.no}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-text-muted">
                          {user.username || "--"} • #{user.id}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="shrink-0 text-xs font-semibold">{labels.selected}</span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-text-muted">{labels.noMatchingUsers}</p>
              )}
            </div>
          </div>
        </>
      )}

      <InputField
        as="select"
        label={labels.gender}
        value={draft.gender}
        onChange={(event) => onFieldUpdate("gender", event.target.value)}
      >
        <option value="MALE">{labels.genderMale}</option>
        <option value="FEMALE">{labels.genderFemale}</option>
      </InputField>

      <InputField
        as="select"
        label={labels.preferredLanguage}
        value={draft.preferredLanguage}
        onChange={(event) => onFieldUpdate("preferredLanguage", event.target.value)}
      >
        <option value="km-KH">km-KH</option>
        <option value="en-US">en-US</option>
      </InputField>

      <InputField
        as="select"
        label={labels.onboardingCompleted}
        value={String(draft.onboardingCompleted)}
        onChange={(event) => onFieldUpdate("onboardingCompleted", event.target.value === "true")}
      >
        <option value="false">{labels.no}</option>
        <option value="true">{labels.yes}</option>
      </InputField>

      <div className="md:col-span-2">
        <InputField
          as="textarea"
          label={labels.bio}
          rows={4}
          value={draft.bio}
          onChange={(event) => onFieldUpdate("bio", event.target.value)}
          required
          requiredMessage={labels.validationRequired}
        />
      </div>

      {errorMessage ? (
        <div className="md:col-span-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}
    </Modal>
  );
}
