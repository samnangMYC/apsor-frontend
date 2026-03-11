import { useId, useRef, useState } from "react";
import { ImageOff, ImagePlus, Trash2 } from "lucide-react";
import Modal from "../../components/shared/Modal";
import InputField from "./InputField";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_IN_BYTES = 3 * 1024 * 1024;

export default function CategoryFormModal({
  categoryDraft,
  modalMode,
  locale,
  labels,
  onClose,
  onSubmit,
  onFieldUpdate,
  onLocalizedFieldUpdate,
}) {
  const formId = useId();
  const imageInputId = useId();
  const imageInputRef = useRef(null);
  const [imageErrorState, setImageErrorState] = useState({ scope: "", message: "" });
  const imageScope = `${categoryDraft?.id || "new"}:${modalMode}`;
  const imageError = imageErrorState.scope === imageScope ? imageErrorState.message : "";
  const isCreateMode = modalMode === "create";
  const isImageMode = modalMode === "image";
  const modalTitle = isImageMode
    ? labels.updateImage
    : isCreateMode
      ? labels.addCategory
      : labels.editCategory;
  const submitLabel = isCreateMode ? labels.create : labels.update;
  const modalDescription = categoryDraft
    ? (isCreateMode
      ? labels.addCategory
      : (categoryDraft.name?.[locale] || categoryDraft.name?.en || labels.categories))
    : undefined;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isImageMode && !categoryDraft?.imageUrl) {
      setImageErrorState({ scope: imageScope, message: labels.validationImageRequired });
      return;
    }

    onSubmit();
  };

  const openFilePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageErrorState({ scope: imageScope, message: labels.validationImageFileType });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_IN_BYTES) {
      setImageErrorState({ scope: imageScope, message: labels.validationImageFileSize });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFieldUpdate("imageUrl", typeof reader.result === "string" ? reader.result : "");
      setImageErrorState({ scope: imageScope, message: "" });
      event.target.value = "";
    };
    reader.onerror = () => {
      setImageErrorState({ scope: imageScope, message: labels.validationImageFileRead });
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onFieldUpdate("imageUrl", "");
    setImageErrorState({ scope: imageScope, message: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={Boolean(categoryDraft)}
      title={modalTitle}
      description={modalDescription}
      closeLabel={labels.close}
      onClose={onClose}
      widthClassName="max-w-2xl"
      bodyClassName="grid gap-4 px-5 py-5 md:grid-cols-2"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex hover:cursor-pointer h-10 items-center rounded-xl border border-border bg-bg-surface px-4 text-sm font-medium text-text-secondary transition hover:border-brand/35 hover:text-brand"
          >
            {labels.close}
          </button>
          <button
            type="submit"
            form={formId}
            className="inline-flex h-10 hover:cursor-pointer items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {submitLabel}
          </button>
        </>
      )}
    >
      {categoryDraft ? (
        <form id={formId} className="contents" onSubmit={handleSubmit}>
          {isImageMode ? (
            <>
              <div className="md:col-span-2">
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-bg-subtle/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{labels.imageUploadTitle}</p>
                    <p className="mt-1 text-sm text-text-secondary">{labels.imageUploadHint}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      id={imageInputId}
                      ref={imageInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-4 text-sm font-semibold text-white transition hover:bg-gradient-to-br"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {categoryDraft.imageUrl ? labels.changeImage : labels.uploadImage}
                    </button>
                    {categoryDraft.imageUrl ? (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-danger/20 bg-danger/8 px-4 text-sm font-medium text-danger transition hover:border-danger/35 hover:bg-danger/12"
                      >
                        <Trash2 className="h-4 w-4" />
                        {labels.removeImage}
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-sm text-text-muted">{labels.imageUploadFormats}</p>
                {imageError ? <p className="mt-2 text-sm text-danger">{imageError}</p> : null}
              </div>
              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-text-secondary">{labels.image}</span>
                {categoryDraft.imageUrl ? (
                  <img
                    src={categoryDraft.imageUrl}
                    alt={categoryDraft.name?.[locale] || categoryDraft.name?.en || labels.categories}
                    className="h-40 w-full rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-subtle text-text-muted">
                    <ImageOff className="h-6 w-6" />
                    <p className="mt-3 text-sm font-medium">{labels.noImageSelected}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <InputField
                label={labels.nameEn}
                type="text"
                value={categoryDraft.name?.en || ""}
                onChange={(event) => onLocalizedFieldUpdate("name", "en", event.target.value)}
                required
                requiredMessage={labels.validationRequired}
              />
              <InputField
                label={labels.nameKm}
                type="text"
                value={categoryDraft.name?.km || ""}
                onChange={(event) => onLocalizedFieldUpdate("name", "km", event.target.value)}
                required
                requiredMessage={labels.validationRequired}
              />
              <InputField
                label={labels.sort}
                type="number"
                value={categoryDraft.sortOrder ?? ""}
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
                rows={3}
                required
                value={categoryDraft.description?.[locale] || ""}
                onChange={(event) => onLocalizedFieldUpdate("description", locale, event.target.value)}
                containerClassName="md:col-span-2"
              />
              <InputField
                as="select"
                label={labels.status}
                value={categoryDraft.status || "ACTIVE"}
                onChange={(event) => onFieldUpdate("status", event.target.value)}
                containerClassName="md:col-span-2"
              >
                <option value="ACTIVE">{labels.statusActive}</option>
                <option value="INACTIVE">{labels.statusInactive}</option>
              </InputField>
            </>
          )}
        </form>
      ) : null}
    </Modal>
  );
}
