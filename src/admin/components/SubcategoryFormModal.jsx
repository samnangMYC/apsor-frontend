import { useId } from "react";
import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

const EMPTY_CATEGORY_VALUE = "__EMPTY_CATEGORY__";

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
  const formId = useId();

  if (!draft) return null;
  const isCreateMode = draft.mode === "create";
  const title = isCreateMode ? labels.addSubcategory : labels.editSubcategory;
  const submitLabel = isCreateMode ? labels.create : labels.update;
  const description = isCreateMode
    ? labels.addSubcategoryTitle
    : draft.name?.en || draft.name?.km || labels.subcategories;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      open={Boolean(draft)}
      title={title}
      description={description}
      closeLabel={labels.close}
      onClose={onClose}
      widthClassName="max-w-2xl"
      panelClassName="max-h-[calc(100vh-2rem)] overflow-hidden"
      bodyClassName="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-5"
      footerClassName="flex-col-reverse sm:flex-row sm:justify-end"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-bg-surface px-4 text-sm font-medium text-text-secondary transition hover:cursor-pointer hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {labels.close}
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/55 sm:w-auto"
          >
            {submitLabel}
          </button>
        </>
      )}
    >
      <form id={formId} className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        {isCreateMode ? (
          <InputField
            as="select"
            label={labels.categoryId}
            value={draft.categoryId ?? EMPTY_CATEGORY_VALUE}
            onChange={(event) => onFieldUpdate(
              "categoryId",
              event.target.value === EMPTY_CATEGORY_VALUE ? "" : Number(event.target.value),
            )}
            required
            requiredMessage={labels.validationRequired}
            placeholder={labels.selectCategory}
          >
            <option value={EMPTY_CATEGORY_VALUE}>{labels.selectCategory}</option>
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
        ) : <div className="hidden md:block" aria-hidden="true" />}
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
          containerClassName="md:col-span-2"
        />
        <InputField
          as="textarea"
          label={labels.descriptionKm}
          rows={4}
          value={draft.description?.km || ""}
          onChange={(event) => onLocalizedFieldUpdate("description", "km", event.target.value)}
          required
          requiredMessage={labels.validationRequired}
          containerClassName="md:col-span-2"
        />
        {errorMessage ? (
          <div className="md:col-span-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
