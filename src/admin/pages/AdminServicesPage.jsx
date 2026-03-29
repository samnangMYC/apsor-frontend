import { useCallback, useEffect, useMemo, useState } from "react";
import AdminToast from "../components/AdminToast";
import DeleteModal from "../components/DeleteModal";
import TableLayout from "../components/TableLayout";
import { adminServiceColumns } from "../../helper/tableColumn";
import { useLang } from "../../i18n/useLang";
import { deleteService, fetchAdminServices, updateServiceStatus } from "../../api";
import {
  ADMIN_SERVICE_DEFAULT_SORTING,
  getAdminServiceText,
  mapAdminServiceSortingToApiQuery,
} from "../utils/adminServicePage";

export default function AdminServicesPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getAdminServiceText(lang), [lang]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [sorting, setSorting] = useState(ADMIN_SERVICE_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [updatingServiceId, setUpdatingServiceId] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortQuery = useMemo(() => mapAdminServiceSortingToApiQuery(sorting), [sorting]);
  const serviceQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
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
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const loadServices = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminServices(serviceQuery);
      setServices(result.items);
      setTotalRows(result.totalElements);
    } catch (error) {
      console.error("Failed to fetch admin services:", error);
      setServices([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [serviceQuery]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

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
      return nextSorting.length ? nextSorting : ADMIN_SERVICE_DEFAULT_SORTING;
    });

    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({
      type,
      title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
      message,
    });
  }, [text.toastErrorTitle, text.toastSuccessTitle]);

  const requestDeleteService = useCallback((service) => {
    const serviceId = service?.id;
    if (!serviceId) return;
    setDeleteTarget(service);
  }, []);

  const closeDeleteAlert = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteService = useCallback(async () => {
    const serviceId = deleteTarget?.id;
    if (!serviceId) return;

    try {
      await deleteService(serviceId);
      setServices((current) => current.filter((item) => item?.id !== serviceId));
      setTotalRows((current) => Math.max(0, current - 1));
      setDeleteTarget(null);
      showToast("success", text.deleteSuccess);
    } catch (error) {
      console.error("Failed to delete admin service:", error);
      showToast(
        "error",
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.deleteError,
      );
    }
  }, [deleteTarget?.id, showToast, text.deleteError, text.deleteSuccess]);

  const handleStatusChange = useCallback(async (service, nextStatus) => {
    const serviceId = service?.id;
    const currentStatus = String(service?.status || "").toUpperCase();
    const normalizedStatus = String(nextStatus || "").toUpperCase();

    if (!serviceId || !normalizedStatus || normalizedStatus === currentStatus) {
      return;
    }

    setUpdatingServiceId(serviceId);

    try {
      await updateServiceStatus(serviceId, normalizedStatus);
      setServices((current) => current.map((item) => (
        item?.id === serviceId
          ? { ...item, status: normalizedStatus }
          : item
      )));
      showToast("success", text.statusUpdateSuccess);
    } catch (error) {
      console.error("Failed to update admin service status:", error);
      showToast(
        "error",
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.statusUpdateFailed,
      );
      await loadServices();
    } finally {
      setUpdatingServiceId(null);
    }
  }, [loadServices, showToast, text.statusUpdateFailed, text.statusUpdateSuccess]);

  const columns = useMemo(
    () => adminServiceColumns({
      text,
      onDelete: requestDeleteService,
      onStatusChange: handleStatusChange,
      updatingServiceId,
    }),
    [handleStatusChange, requestDeleteService, text, updatingServiceId],
  );

  return (
    <section className="min-w-0 space-y-4">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <DeleteModal
        open={Boolean(deleteTarget)}
        tone="danger"
        title={text.deleteTitle}
        message={text.deleteConfirm}
        confirmLabel={text.delete}
        cancelLabel={text.close}
        onClose={closeDeleteAlert}
        onConfirm={handleDeleteService}
      />
      <TableLayout
        columns={columns}
        data={services}
        isLoading={isLoading}
        title={text.services}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
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
    </section>
  );
}
