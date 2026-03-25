import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

export default function SubcategoryFormModal({
  draft,
  labels,
  categoryOptions = [],
  errorMessage = "",
  isSubmitting = false,
  onClose,
  onSubmit,
  onFieldUpdate,
  onLocalizedFieldUpdate,
}) {
  if (!draft) return null;
  const isCreateMode = draft.mode === "create";
  const title = isCreateMode ? labels.addSubcategory : labels.editSubcategory;
  const submitLabel = isCreateMode ? labels.create : labels.update;
  const description = draft.name?.en || draft.name?.km || labels.subcategories;

  return (
    <Modal
      open={Boolean(draft)}
      title={title}
      description={description}
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
            {submitLabel}
          </button>
        </>
      )}
    >
      {isCreateMode ? (
        <InputField
          as="select"
          label={labels.categoryId}
          value={draft.categoryId ?? ""}
          onChange={(event) => onFieldUpdate("categoryId", event.target.value === "" ? "" : Number(event.target.value))}
          required
          requiredMessage={labels.validationRequired}
        >
          <option value="">{labels.selectCategory}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </InputField>
      ) : (
        <InputField
          label={labels.categoryId}
          type="text"
          value={draft.categoryName || "--"}
          disabled
        />
      )}
      {!isCreateMode ? (
        <InputField
          label={labels.slug}
          type="text"
          value={draft.slug || ""}
          disabled
        />
      ) : <div />}
      <InputField
        label={labels.nameEn}
        type="text"
        value={draft.name?.en || ""}
        onChange={(event) => onLocalizedFieldUpdate("name", "en", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        label={labels.nameKm}
        type="text"
        value={draft.name?.km || ""}
        onChange={(event) => onLocalizedFieldUpdate("name", "km", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        label={labels.sort}
        type="number"
        value={draft.sortOrder ?? ""}
        min="0"
        step="1"
        onChange={(event) => onFieldUpdate("sortOrder", event.target.value === "" ? "" : Number(event.target.value))}
        required
        requiredMessage={labels.validationSortRequired}
        customValidator={(value, element) => {
          if (element.validity.badInput) return labels.validationSort;
          if (value === "") return labels.validationSortRequired;
          return Number.isInteger(Number(value)) && Number(value) >= 0 ? "" : labels.validationSort;
        }}
      />
      <InputField
        as="textarea"
        label={labels.descriptionEn}
        rows={4}
        value={draft.description?.en || ""}
        onChange={(event) => onLocalizedFieldUpdate("description", "en", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      <InputField
        as="textarea"
        label={labels.descriptionKm}
        rows={4}
        value={draft.description?.km || ""}
        onChange={(event) => onLocalizedFieldUpdate("description", "km", event.target.value)}
        required
        requiredMessage={labels.validationRequired}
      />
      {errorMessage ? (
        <div className="md:col-span-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}
    </Modal>
  );
}
