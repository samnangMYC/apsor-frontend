import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyCategoryDraft,
  createCategoryDraft,
  createEmptyCategoryDraft,
  getAdminCategoryText,
} from "../utils/categoryAdmin";
import {
  ADMIN_CATEGORY_ALL_STATUS,
  ADMIN_CATEGORY_DEFAULT_SORTING,
  getAdminCategoryActiveImage,
  getAdminCategoryApiErrorMessage,
  getAdminCategoryImageDeleteTargetId,
  mapAdminCategorySortingToApiQuery,
} from "../utils/adminCategoryPage";
import { useLang } from "../../i18n/useLang";
import { Plus } from "lucide-react";
import AdminToast from "../components/AdminToast";
import AdminSelect from "../components/AdminSelect";
import DeleteModal from "../components/DeleteModal";
import TableLayout from "../components/TableLayout";
import { adminCategoryColumns } from "../../helper/tableColumn";
import CategoryFormModal from "../components/CategoryFormModal";
import {
  createAdminCategory,
  deleteAdminCategory,
  deleteAdminCategoryImage,
  fetchAdminCategoryImages,
  fetchAdminCategories,
  updateAdminCategory,
  updateAdminCategoryStatus,
  uploadAdminCategoryImage,
} from "../../api";

export default function AdminCategoriesPage() {
  const { lang, t } = useLang("km");
  const text = useMemo(() => getAdminCategoryText(lang, t), [lang, t]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editor, setEditor] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ADMIN_CATEGORY_ALL_STATUS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState(ADMIN_CATEGORY_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const sortQuery = useMemo(() => mapAdminCategorySortingToApiQuery(sorting), [sorting]);
  const categoryQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
    status: statusFilter === ADMIN_CATEGORY_ALL_STATUS ? undefined : statusFilter,
    pageNumber: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sortQuery.sortBy,
    sortOrder: sortQuery.sortOrder,
  }), [
    debouncedSearchValue,
    pagination.pageIndex,
    pagination.pageSize,
    sortQuery.sortBy,
    sortQuery.sortOrder,
    statusFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminCategories(categoryQuery);

      setCategories(result.items);
      setTotalRows(result.totalItems);
    } catch (error) {
      console.error("Failed to fetch admin categories:", error);
      setCategories([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [categoryQuery]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!toast?.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timerId);
  }, [toast]);

  const refreshCategories = useCallback(async () => {
    if (pagination.pageIndex === 0) {
      await loadCategories();
      return;
    }

    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [loadCategories, pagination.pageIndex]);
  const showToast = useCallback((type, message) => {
    setToast({
      type,
      title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
      message,
    });
  }, [text.toastErrorTitle, text.toastSuccessTitle]);

  const openEditor = useCallback((category, mode = "edit") => {
    setFormError("");
    setEditor({
      mode,
      categoryId: category.id,
      draft: createCategoryDraft(category),
    });
  }, []);

  const openCreator = useCallback(() => {
    setFormError("");
    setEditor({
      mode: "create",
      categoryId: null,
      draft: createEmptyCategoryDraft(),
    });
  }, []);

  const closeEditor = useCallback(() => {
    setFormError("");
    setEditor(null);
  }, []);

  const requestDelete = useCallback((categoryId) => {
    setDeleteTargetId(categoryId);
  }, []);

  const closeDeleteAlert = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (deleteTargetId === null) return;

    setIsSubmitting(true);

    try {
      await deleteAdminCategory(deleteTargetId);
      setDeleteTargetId(null);
      showToast("success", text.toastDeleteSuccess);

      if (categories.length === 1 && pagination.pageIndex > 0) {
        setPagination((current) => ({ ...current, pageIndex: current.pageIndex - 1 }));
        return;
      }

      await loadCategories();
    } catch (error) {
      console.error("Failed to delete admin category:", error);
      showToast("error", getAdminCategoryApiErrorMessage(error, text.requestFailed));
    } finally {
      setIsSubmitting(false);
    }
  }, [categories.length, deleteTargetId, loadCategories, pagination.pageIndex, showToast, text.requestFailed, text.toastDeleteSuccess]);

  const updateDraftField = useCallback((field, value) => {
    setFormError("");
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
    setFormError("");
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

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_CATEGORY_DEFAULT_SORTING;
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);
  const handleCreateSave = useCallback(async (activeEditor) => {
    await createAdminCategory({
      name: activeEditor.draft.name,
      description: activeEditor.draft.description,
      sortOrder: activeEditor.draft.sortOrder,
    });

    setEditor(null);
    showToast("success", text.toastCreateSuccess);
    await refreshCategories();
  }, [refreshCategories, showToast, text.toastCreateSuccess]);

  const handleEditSave = useCallback(async (activeEditor) => {
    await updateAdminCategory(activeEditor.categoryId, {
      name: activeEditor.draft.name,
      slug: activeEditor.draft.slug,
      description: activeEditor.draft.description,
      sortOrder: activeEditor.draft.sortOrder,
    });
    await updateAdminCategoryStatus(
      activeEditor.categoryId,
      activeEditor.draft.status || "ACTIVE",
    );

    setEditor(null);
    showToast("success", text.toastUpdateSuccess);
    await loadCategories();
  }, [loadCategories, showToast, text.toastUpdateSuccess]);

  const handleImageSave = useCallback(async (activeEditor) => {
    const wantsRemove = Boolean(activeEditor.draft.removeImage);
    const hasNewImage = Boolean(activeEditor.draft.imageFile);

    if (!wantsRemove && !hasNewImage) {
      return;
    }

    const images = await fetchAdminCategoryImages(activeEditor.categoryId);
    const activeImage = getAdminCategoryActiveImage(images);
    const targetId = getAdminCategoryImageDeleteTargetId(activeImage);

    if (wantsRemove) {
      if (targetId !== null) {
        await deleteAdminCategoryImage(activeEditor.categoryId, targetId);
      }
    } else if (targetId !== null) {
      await deleteAdminCategoryImage(activeEditor.categoryId, targetId);
      await uploadAdminCategoryImage(activeEditor.categoryId, activeEditor.draft.imageFile);
    } else {
      await uploadAdminCategoryImage(activeEditor.categoryId, activeEditor.draft.imageFile);
    }

    setEditor(null);
    showToast("success", text.toastImageSuccess);
    await loadCategories();
  }, [loadCategories, showToast, text.toastImageSuccess]);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      if (editor.mode === "create") {
        await handleCreateSave(editor);
      } else if (editor.mode === "edit") {
        await handleEditSave(editor);
      } else if (editor.mode === "image") {
        await handleImageSave(editor);
      } else {
        setCategories((current) => current.map((item) => (
          item.id === editor.categoryId
            ? applyCategoryDraft(item, editor.draft)
            : item
        )));
        setEditor(null);
      }
    } catch (error) {
      const actionLabel = editor.mode === "image"
        ? "upload category image"
        : editor.mode === "edit"
          ? "update admin category"
          : "create admin category";

      console.error(`Failed to ${actionLabel}:`, error);
      const errorMessage = getAdminCategoryApiErrorMessage(error, text.requestFailed);
      setFormError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, handleCreateSave, handleEditSave, handleImageSave, showToast, text.requestFailed]);

  const columns = useMemo(() => adminCategoryColumns({
    lang,
    text,
    onEdit: (category) => openEditor(category, "edit"),
    onEditImage: (category) => openEditor(category, "image"),
    onDelete: requestDelete,
  }), [lang, openEditor, requestDelete, text]);
  const statusFilterControl = (
    <AdminSelect
      value={statusFilter}
      onChange={(event) => {
        setStatusFilter(event.target.value);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
      }}
      className="md:w-[180px]"
      aria-label={text.status}
    >
      <option value={ADMIN_CATEGORY_ALL_STATUS}>{text.filterAllStatuses}</option>
      <option value="ACTIVE">{text.statusActive}</option>
      <option value="INACTIVE">{text.statusInactive}</option>
    </AdminSelect>
  );
  const addCategoryButton = (
    <button
      type="button"
      onClick={openCreator}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover md:w-auto md:shrink-0"
    >
      <Plus className="h-4 w-4" />
      {text.addCategory}
    </button>
  );

  return (
    <section className="min-w-0 space-y-4">
      <AdminToast
        toast={toast}
        onClose={() => setToast(null)}
      />

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
        headerAction={addCategoryButton}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        toolbarContent={statusFilterControl}
        controlledPagination={pagination}
        onControlledPaginationChange={setPagination}
        controlledSorting={sorting}
        onControlledSortingChange={handleSortingChange}
        totalRows={totalRows}
        pageCount={Math.max(1, Math.ceil(totalRows / pagination.pageSize))}
        manualPagination
        manualSorting
        manualFiltering
      />

      <CategoryFormModal
        categoryDraft={editor?.draft || null}
        modalMode={editor?.mode || "edit"}
        locale={lang}
        labels={text}
        errorMessage={formError}
        onClose={closeEditor}
        onSubmit={handleSave}
        onFieldUpdate={updateDraftField}
        onLocalizedFieldUpdate={updateDraftLocalizedField}
        isSubmitting={isSubmitting}
      />
      
    </section>
  );
}
