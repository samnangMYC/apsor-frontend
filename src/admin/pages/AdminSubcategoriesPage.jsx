import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AdminSelect from "../components/AdminSelect";
import DeleteModal from "../components/DeleteModal";
import SubcategoryFormModal from "../components/SubcategoryFormModal";
import TableLayout from "../components/TableLayout";
import { useLang } from "../../i18n/useLang";
import {
  createAdminSubcategory,
  deleteAdminSubcategory,
  fetchAdminCategories,
  fetchAdminSubcategories,
  updateAdminSubcategory,
} from "../../api";
import {
  ADMIN_SUBCATEGORY_ALL_STATUS,
  ADMIN_SUBCATEGORY_DEFAULT_SORTING,
  getAdminSubcategoryText,
  mapAdminSubcategorySortingToApiQuery,
} from "../utils/adminSubcategoryPage";
import { adminSubcategoryColumns } from "../../helper/tableColumn";

export default function AdminSubcategoriesPage() {
  const { lang, t } = useLang("km");
  const text = useMemo(() => getAdminSubcategoryText(lang, t), [lang, t]);
  const [isLoading, setIsLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [editor, setEditor] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ADMIN_SUBCATEGORY_ALL_STATUS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState(ADMIN_SUBCATEGORY_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const sortQuery = useMemo(() => mapAdminSubcategorySortingToApiQuery(sorting), [sorting]);
  const subcategoryQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
    status: statusFilter === ADMIN_SUBCATEGORY_ALL_STATUS ? undefined : statusFilter,
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

  const loadSubcategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminSubcategories(subcategoryQuery);
      setSubcategories(result.items);
      setTotalRows(result.totalItems);
    } catch (error) {
      console.error("Failed to fetch admin subcategories:", error);
      setSubcategories([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [subcategoryQuery]);

  useEffect(() => {
    loadSubcategories();
  }, [loadSubcategories]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const result = await fetchAdminCategories({
          pageNumber: 0,
          pageSize: 200,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (!isMounted) {
          return;
        }

        const nextCategoryMap = result.items.reduce((accumulator, category) => {
          accumulator[category.id] = category.name?.[lang] || category.name?.en || String(category.id);
          return accumulator;
        }, {});

        setCategoryMap(nextCategoryMap);
      } catch (error) {
        console.error("Failed to fetch categories for subcategory labels:", error);

        if (isMounted) {
          setCategoryMap({});
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_SUBCATEGORY_DEFAULT_SORTING;
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);
  const openEditor = useCallback((subcategory) => {
    setFormError("");
    setEditor({
      mode: "edit",
      id: subcategory.id,
      categoryId: subcategory.categoryId ?? "",
      categoryName: categoryMap[subcategory.categoryId] || String(subcategory.categoryId || "--"),
      slug: subcategory.slug || "",
      name: {
        en: subcategory.name?.en || "",
        km: subcategory.name?.km || "",
      },
      description: {
        en: subcategory.description?.en || "",
        km: subcategory.description?.km || "",
      },
      sortOrder: subcategory.sortOrder ?? 0,
    });
  }, [categoryMap]);
  const openCreator = useCallback(() => {
    setFormError("");
    setEditor({
      mode: "create",
      id: null,
      categoryId: "",
      categoryName: "",
      slug: "",
      name: { en: "", km: "" },
      description: { en: "", km: "" },
      sortOrder: 0,
    });
  }, []);
  const closeEditor = useCallback(() => {
    setFormError("");
    setEditor(null);
  }, []);
  const requestDelete = useCallback((subcategoryId) => {
    setDeleteTargetId(subcategoryId);
  }, []);
  const closeDeleteAlert = useCallback(() => {
    setDeleteTargetId(null);
  }, []);
  const updateDraftField = useCallback((field, value) => {
    setFormError("");
    setEditor((current) => (current ? { ...current, [field]: value } : current));
  }, []);
  const updateDraftLocalizedField = useCallback((field, locale, value) => {
    setFormError("");
    setEditor((current) => (
      current
        ? {
            ...current,
            [field]: {
              ...current[field],
              [locale]: value,
            },
          }
        : current
    ));
  }, []);
  const handleSave = useCallback(async () => {
    if (!editor) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      if (editor.mode === "create") {
        await createAdminSubcategory({
          categoryId: editor.categoryId,
          name: editor.name,
          description: editor.description,
          sortOrder: editor.sortOrder,
        });
      } else {
        await updateAdminSubcategory(editor.id, {
          name: editor.name,
          description: editor.description,
          sortOrder: editor.sortOrder,
        });
      }
      setEditor(null);
      await loadSubcategories();
    } catch (error) {
      console.error(`Failed to ${editor.mode === "create" ? "create" : "update"} admin subcategory:`, error);
      const responseData = error?.response?.data;
      const message = typeof responseData === "string"
        ? responseData
        : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, loadSubcategories, text.requestFailed]);
  const handleDelete = useCallback(async () => {
    if (deleteTargetId === null) return;

    setIsSubmitting(true);

    try {
      await deleteAdminSubcategory(deleteTargetId);
      setDeleteTargetId(null);

      if (subcategories.length === 1 && pagination.pageIndex > 0) {
        setPagination((current) => ({ ...current, pageIndex: current.pageIndex - 1 }));
        return;
      }

      await loadSubcategories();
    } catch (error) {
      console.error("Failed to delete admin subcategory:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteTargetId, loadSubcategories, pagination.pageIndex, subcategories.length]);

  const columns = useMemo(
    () => adminSubcategoryColumns({
      lang,
      text,
      resolveCategoryName: (categoryId) => categoryMap[categoryId] || String(categoryId || "--"),
      onEdit: openEditor,
      onDelete: requestDelete,
    }),
    [categoryMap, lang, openEditor, requestDelete, text],
  );
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
      <option value={ADMIN_SUBCATEGORY_ALL_STATUS}>{text.filterAllStatuses}</option>
      <option value="ACTIVE">{text.statusActive}</option>
      <option value="INACTIVE">{text.statusInactive}</option>
    </AdminSelect>
  );
  const categoryOptions = useMemo(
    () => Object.entries(categoryMap).map(([value, label]) => ({
      value: Number(value),
      label,
    })),
    [categoryMap],
  );
  const headerAction = (
    <button
      type="button"
      onClick={openCreator}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
    >
      <Plus className="h-4 w-4" />
      {text.addSubcategory}
    </button>
  );

  return (
    <section className="min-w-0 space-y-4">
      <DeleteModal
        open={deleteTargetId !== null}
        tone="danger"
        title={text.deleteTitle}
        message={text.deleteConfirm}
        confirmLabel={text.delete}
        cancelLabel={text.close}
        onClose={closeDeleteAlert}
        onConfirm={handleDelete}
      />

      <TableLayout
        columns={columns}
        data={subcategories}
        isLoading={isLoading}
        title={text.subcategories}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        toolbarContent={statusFilterControl}
        headerAction={headerAction}
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

      <SubcategoryFormModal
        draft={editor}
        labels={text}
        categoryOptions={categoryOptions}
        errorMessage={formError}
        isSubmitting={isSubmitting}
        onClose={closeEditor}
        onSubmit={handleSave}
        onFieldUpdate={updateDraftField}
        onLocalizedFieldUpdate={updateDraftLocalizedField}
      />
    </section>
  );
}
