import { useId, useRef, useState } from "react";
import { ImageOff, ImagePlus } from "lucide-react";
import Modal from "../../components/shared/Modal";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_IN_BYTES = 8 * 1024 * 1024;

function formatFileSizeInMb(bytes) {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

export default function ProviderAvatarModal({
  draft,
  labels,
  errorMessage = "",
  isSubmitting = false,
  onClose,
  onSubmit,
  onFieldUpdate,
}) {
  const formId = useId();
  const inputId = useId();
  const inputRef = useRef(null);
  const [imageError, setImageError] = useState("");

  if (!draft) return null;

  const selectedImageSize = draft.file?.size ?? 0;
  const isSubmitDisabled = isSubmitting || !draft.file || Boolean(imageError);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    setImageError("");

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onFieldUpdate("file", null);
      onFieldUpdate("previewUrl", draft.currentImageUrl || "");
      setImageError(labels.validationImageFileType);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_IN_BYTES) {
      onFieldUpdate("file", null);
      onFieldUpdate("previewUrl", draft.currentImageUrl || "");
      setImageError(labels.validationImageFileSize);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFieldUpdate("file", file);
      onFieldUpdate("previewUrl", typeof reader.result === "string" ? reader.result : "");
      setImageError("");
      event.target.value = "";
    };
    reader.onerror = () => {
      setImageError(labels.validationImageFileRead);
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.file) {
      setImageError(labels.validationImageRequired);
      return;
    }
    onSubmit();
  };

  return (
    <Modal
      open={Boolean(draft)}
      title={labels.uploadAvatar}
      description={draft.displayName || draft.email || labels.provider}
      closeLabel={labels.close}
      onClose={onClose}
      widthClassName="max-w-2xl"
      bodyClassName="px-5 py-5"
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
            type="submit"
            form={formId}
            disabled={isSubmitDisabled}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/55"
          >
            {labels.uploadAvatar}
          </button>
        </>
      )}
    >
      <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-bg-subtle/40 p-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">{labels.imageUploadTitle}</p>
            <p className="mt-1 text-sm text-text-secondary">{labels.imageUploadHint}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <input
              id={inputId}
              ref={inputRef}
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
              {labels.uploadAvatar}
            </button>
          </div>
        </div>

        <p className="text-sm text-text-muted">{labels.imageUploadFormats}</p>

        {selectedImageSize > 0 ? (
          <p className="text-sm text-text-secondary">
            Selected file size: {formatFileSizeInMb(selectedImageSize)} MB
          </p>
        ) : null}

        {imageError ? (
          <div className="rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
            {imageError}
          </div>
        ) : null}

        {!imageError && errorMessage ? (
          <div className="rounded-xl border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}

        <div>
          <span className="mb-2 block text-sm font-medium text-text-secondary">{labels.image}</span>
          {draft.previewUrl ? (
            <img
              src={draft.previewUrl}
              alt={draft.displayName || draft.email || labels.provider}
              className="h-48 w-full rounded-xl border border-border object-cover"
            />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-subtle text-text-muted">
              <ImageOff className="h-6 w-6" />
              <p className="mt-3 text-sm font-medium">{labels.noImageSelected}</p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
