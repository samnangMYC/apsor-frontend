import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

export default function SubcategoryFormModal({
  draft,
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
      title={labels.editSubcategory}
      description={draft.name || labels.subcategories}
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
            {labels.update}
          </button>
        </>
      )}
    >
      <InputField
        label={labels.categoryId}
        type="text"
        value={draft.categoryName || "--"}
        disabled
      />
      <InputField
        label={labels.slug}
        type="text"
        value={draft.slug || ""}
        disabled
      />
      <InputField
        label={labels.name}
        type="text"
        value={draft.name || ""}
        onChange={(event) => onFieldUpdate("name", event.target.value)}
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
        label={labels.description}
        rows={4}
        value={draft.description || ""}
        onChange={(event) => onFieldUpdate("description", event.target.value)}
        containerClassName="md:col-span-2"
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
