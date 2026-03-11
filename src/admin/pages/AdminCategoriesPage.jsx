import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_CATEGORIES } from "../data/adminCategories";
import {
  applyCategoryDraft,
  createCategoryDraft,
  createCategoryFromDraft,
  createEmptyCategoryDraft,
  getAdminCategoryText,
} from "../utils/categoryAdmin";
import { useLang } from "../../i18n/useLang";
import { Plus } from "lucide-react";
import DeleteModal from "../components/DeleteModal";
import TableLayout from "../components/TableLayout";
import { adminCategoryColumns } from "../../helper/tableColumn";
import CategoryFormModal from "../components/CategoryFormModal";

function createInitialCategories() {
  return ADMIN_CATEGORIES.map((item) => ({ ...item }));
}

export default function AdminCategoriesPage() {
  const { lang, t } = useLang("km");
  const text = useMemo(() => getAdminCategoryText(lang, t), [lang, t]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(createInitialCategories);
  const [editor, setEditor] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timerId);
  }, []);

  const openEditor = useCallback((category, mode = "edit") => {
    setEditor({
      mode,
      categoryId: category.id,
      draft: createCategoryDraft(category),
    });
  }, []);

  const openCreator = useCallback(() => {
    setEditor({
      mode: "create",
      categoryId: null,
      draft: createEmptyCategoryDraft(),
    });
  }, []);

  const closeEditor = useCallback(() => {
    setEditor(null);
  }, []);

  const requestDelete = useCallback((categoryId) => {
    setDeleteTargetId(categoryId);
  }, []);

  const closeDeleteAlert = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTargetId === null) return;
    setCategories((current) => current.filter((item) => item.id !== deleteTargetId));
    setDeleteTargetId(null);
  }, [deleteTargetId]);

  const updateDraftField = useCallback((field, value) => {
    setEditor((current) => (
      current
        ? {
            ...current,
            draft: { ...current.draft, [field]: value },
          }
        : current
    ));
  }, []);

  const updateDraftLocalizedField = useCallback((field, locale, value) => {
    setEditor((current) => (
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              [field]: {
                ...current.draft[field],
                [locale]: value,
              },
            },
          }
        : current
    ));
  }, []);

  const handleSave = useCallback(() => {
    if (!editor) return;

    setCategories((current) => {
      if (editor.mode === "create") {
        const nextId = current.length
          ? Math.max(...current.map((item) => Number(item.id) || 0)) + 1
          : 1;

        return [createCategoryFromDraft(editor.draft, nextId), ...current];
      }

      return current.map((item) => (
        item.id === editor.categoryId
          ? applyCategoryDraft(item, editor.draft)
          : item
      ));
    });
    setEditor(null);
  }, [editor]);

  const columns = useMemo(() => adminCategoryColumns({
    lang,
    text,
    onEdit: (category) => openEditor(category, "edit"),
    onEditImage: (category) => openEditor(category, "image"),
    onDelete: requestDelete,
  }), [lang, openEditor, requestDelete, text]);

  return (
    <section className="min-w-0 space-y-4">
      <DeleteModal
        open={deleteTargetId !== null}
        tone="danger"
        title={text.deleteTitle}
        message={text.deleteConfirm}
        confirmLabel={text.delete}
        cancelLabel={text.cancel}
        onClose={closeDeleteAlert}
        onConfirm={handleDelete}
      />

      <TableLayout
        columns={columns}
        data={categories}
        isLoading={isLoading}
        title={text.categories}
        headerAction={(
          <button
            type="button"
            onClick={openCreator}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover md:w-auto md:shrink-0"
          >
            <Plus className="h-4 w-4" />
            {text.addCategory}
          </button>
        )}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
      />

      <CategoryFormModal
        categoryDraft={editor?.draft || null}
        modalMode={editor?.mode || "edit"}
        locale={lang}
        labels={text}
        onClose={closeEditor}
        onSubmit={handleSave}
        onFieldUpdate={updateDraftField}
        onLocalizedFieldUpdate={updateDraftLocalizedField}
      />
      
    </section>
  );
}
