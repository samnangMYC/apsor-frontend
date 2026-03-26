import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AdminSelect from "../components/AdminSelect";
import AdminToast from "../components/AdminToast";
import DeleteModal from "../components/DeleteModal";
import UserFormModal from "../components/UserFormModal";
import TableLayout from "../components/TableLayout";
import { useLang } from "../../i18n/useLang";
import { getStoredCurrentUser } from "../../page/auth/authStorage";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  hardDeleteAdminUser,
  updateAdminUser,
  updateAdminUserPassword,
  updateAdminUserType,
} from "../../api";
import {
  ADMIN_USER_ALL_STATUS,
  ADMIN_USER_DEFAULT_SORTING,
  getAdminUserText,
  mapAdminUserSortingToApiQuery,
} from "../utils/adminUserPage";
import { adminUserColumns } from "../../helper/tableColumn";

export default function AdminUsersPage() {
  const { lang, t } = useLang("km");
  const text = useMemo(() => getAdminUserText(lang, t), [lang, t]);
  const currentUser = useMemo(() => getStoredCurrentUser(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ADMIN_USER_ALL_STATUS);
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState(ADMIN_USER_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const sortQuery = useMemo(() => mapAdminUserSortingToApiQuery(sorting), [sorting]);
  const userQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
    status: statusFilter === ADMIN_USER_ALL_STATUS ? undefined : statusFilter,
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

  const loadUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminUsers(userQuery);
      setUsers(result.items);
      setTotalRows(result.totalItems);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      setUsers([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [userQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!toast?.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timerId);
  }, [toast]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_USER_DEFAULT_SORTING;
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);
  const openCreator = useCallback(() => {
    setFormError("");
    setEditor({
      mode: "create",
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      userType: "CUSTOMER",
      status: "ACTIVE",
      phoneNumber: "",
      temporaryPassword: "",
    });
  }, []);
  const openEditor = useCallback((user) => {
    setFormError("");
    setEditor({
      id: user.id,
      mode: "edit",
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      userType: user.userType || "CUSTOMER",
      initialUserType: user.userType || "CUSTOMER",
      status: user.status || "ACTIVE",
      phoneNumber: user.phoneNumber || "",
      newPassword: "",
    });
  }, []);
  const closeEditor = useCallback(() => {
    setFormError("");
    setEditor(null);
  }, []);
  const isCurrentUser = useCallback((userId) => {
    if (userId == null || currentUser?.id == null) return false;
    return String(userId) === String(currentUser.id);
  }, [currentUser?.id]);
  const showToast = useCallback((type, message) => {
    setToast({
      type,
      title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
      message,
    });
  }, [text.toastErrorTitle, text.toastSuccessTitle]);
  const requestSoftDelete = useCallback((userId) => {
    if (isCurrentUser(userId)) {
      showToast("error", text.selfDeleteNotAllowed);
      return;
    }

    setDeleteTarget({ id: userId, mode: "soft" });
  }, [isCurrentUser, showToast, text.selfDeleteNotAllowed]);
  const requestHardDelete = useCallback((userId) => {
    if (isCurrentUser(userId)) {
      showToast("error", text.selfDeleteNotAllowed);
      return;
    }

    setDeleteTarget({ id: userId, mode: "hard" });
  }, [isCurrentUser, showToast, text.selfDeleteNotAllowed]);
  const closeDeleteAlert = useCallback(() => {
    setDeleteTarget(null);
  }, []);
  const updateDraftField = useCallback((field, value) => {
    setFormError("");
    setEditor((current) => (current ? { ...current, [field]: value } : current));
  }, []);
  const refreshUsers = useCallback(async () => {
    if (pagination.pageIndex === 0) {
      await loadUsers();
      return;
    }

    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [loadUsers, pagination.pageIndex]);
  const handleSubmitUser = useCallback(async () => {
    if (!editor) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      if (editor.mode === "edit") {
        await updateAdminUser(editor.id, editor);

        if (editor.userType !== editor.initialUserType) {
          await updateAdminUserType(editor.id, editor.userType);
        }

        if (editor.newPassword?.trim()) {
          await updateAdminUserPassword(editor.id, editor.newPassword.trim());
          showToast("success", text.toastPasswordSuccess);
        } else {
          showToast("success", text.toastUpdateSuccess);
        }
      } else {
        await createAdminUser(editor);
        showToast("success", text.toastCreateSuccess);
      }
      setEditor(null);
      await refreshUsers();
    } catch (error) {
      console.error(`Failed to ${editor.mode === "edit" ? "update" : "create"} admin user:`, error);
      const responseData = error?.response?.data;
      const message = typeof responseData === "string"
        ? responseData
        : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
      setFormError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, refreshUsers, showToast, text.requestFailed, text.toastCreateSuccess, text.toastPasswordSuccess, text.toastUpdateSuccess]);
  const handleDeleteUser = useCallback(async () => {
    if (!deleteTarget?.id) return;

    setIsSubmitting(true);

    try {
      if (deleteTarget.mode === "hard") {
        await hardDeleteAdminUser(deleteTarget.id);
        showToast("success", text.toastHardDeleteSuccess);
      } else {
        await deleteAdminUser(deleteTarget.id);
        showToast("success", text.toastSoftDeleteSuccess);
      }

      setDeleteTarget(null);
      await refreshUsers();
    } catch (error) {
      console.error(`Failed to ${deleteTarget.mode === "hard" ? "hard delete" : "soft delete"} admin user:`, error);
      const responseData = error?.response?.data;
      const message = typeof responseData === "string"
        ? responseData
        : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteTarget, refreshUsers, showToast, text.requestFailed, text.toastHardDeleteSuccess, text.toastSoftDeleteSuccess]);

  const columns = useMemo(
    () => adminUserColumns({
      text,
      currentUserId: currentUser?.id,
      onEdit: openEditor,
      onSoftDelete: requestSoftDelete,
      onHardDelete: requestHardDelete,
    }),
    [currentUser?.id, openEditor, requestHardDelete, requestSoftDelete, text],
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
      <option value={ADMIN_USER_ALL_STATUS}>{text.filterAllStatuses}</option>
      <option value="ACTIVE">{text.statusActive}</option>
      <option value="SUSPENDED">{text.statusSuspended}</option>
      <option value="DELETED">{text.filterDeleted}</option>
    </AdminSelect>
  );
  const addUserButton = (
    <button
      type="button"
      onClick={openCreator}
      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover md:w-auto md:shrink-0"
    >
      <Plus className="h-4 w-4" />
      {text.addUser}
    </button>
  );

  return (
    <section className="min-w-0 space-y-4">
      <AdminToast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        tone="danger"
        title={deleteTarget?.mode === "hard" ? text.hardDeleteTitle : text.deleteTitle}
        message={deleteTarget?.mode === "hard" ? text.hardDeleteConfirm : text.deleteConfirm}
        confirmLabel={deleteTarget?.mode === "hard" ? text.hardDelete : text.softDelete}
        cancelLabel={text.close}
        onClose={closeDeleteAlert}
        onConfirm={handleDeleteUser}
      />

      <TableLayout
        columns={columns}
        data={users}
        isLoading={isLoading}
        title={text.users}
        headerAction={addUserButton}
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

      <UserFormModal
        draft={editor}
        mode={editor?.mode || "create"}
        labels={text}
        errorMessage={formError}
        isSubmitting={isSubmitting}
        onClose={closeEditor}
        onSubmit={handleSubmitUser}
        onFieldUpdate={updateDraftField}
      />
    </section>
  );
}
