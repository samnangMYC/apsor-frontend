import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

export default function ProviderFormModal({
  draft,
  userOptions = [],
  isUserSearchLoading = false,
  labels,
  errorMessage = "",
  isSubmitting = false,
  onClose,
  onSubmit,
  onFieldUpdate,
}) {
  if (!draft) return null;

  return (
    <Modal
      open={Boolean(draft)}
      title={labels.addProvider}
      description={labels.providerManagement}
      closeLabel={labels.close}
      onClose={onClose}
      widthClassName="max-w-3xl"
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
            {labels.create}
          </button>
        </>
      )}
    >
      <InputField
        label={labels.email}
        type="email"
        value={draft.userEmailSearch}
        onChange={(event) => onFieldUpdate("userEmailSearch", event.target.value)}
        placeholder={labels.emailSearchPlaceholder}
        required
        requiredMessage={labels.validationRequired}
      />

      <InputField
        label={labels.displayName}
        type="text"
        value={draft.displayName}
        onChange={(event) => onFieldUpdate("displayName", event.target.value)}
        placeholder="Chantha Services"
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

      <InputField
        label={labels.businessName}
        type="text"
        value={draft.businessName}
        onChange={(event) => onFieldUpdate("businessName", event.target.value)}
        placeholder="Chantha Enterprises"
        required
        requiredMessage={labels.validationRequired}
      />

      <InputField
        as="select"
        label={labels.businessType}
        value={draft.businessType}
        onChange={(event) => onFieldUpdate("businessType", event.target.value)}
      >
        <option value="COMPANY">{labels.businessTypeCompany}</option>
        <option value="INDIVIDUAL">{labels.businessTypeIndividual}</option>
      </InputField>

      <InputField
        label={labels.establishedAt}
        type="date"
        value={draft.establishedAt}
        onChange={(event) => onFieldUpdate("establishedAt", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />

      <InputField
        label={labels.telegram}
        type="text"
        value={draft.telegram}
        onChange={(event) => onFieldUpdate("telegram", event.target.value)}
        placeholder="+855 12 345 678"
      />

      <div className="md:col-span-2">
        <InputField
          as="textarea"
          label={labels.bio}
          rows={4}
          value={draft.bio}
          onChange={(event) => onFieldUpdate("bio", event.target.value)}
          placeholder="Dedicated provider offering top-notch services in Phnom Penh. With a focus on reliability and customer satisfaction, we have been serving the community since 2015."
          required
          requiredMessage={labels.validationRequired}
        />
      </div>

      <InputField
        label={labels.websiteUrl}
        type="url"
        value={draft.websiteUrl}
        onChange={(event) => onFieldUpdate("websiteUrl", event.target.value)}
        placeholder="https://samnangservices.com"
      />

      <InputField
        label={labels.facebookUrl}
        type="url"
        value={draft.facebookUrl}
        onChange={(event) => onFieldUpdate("facebookUrl", event.target.value)}
        placeholder="https://www.facebook.com/samnangenterprises"
      />

      {errorMessage ? (
        <div className="md:col-span-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}
    </Modal>
  );
}
