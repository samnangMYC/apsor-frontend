import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpenDot, Plus, RefreshCw } from "lucide-react";
import TableLayout from "../../admin/components/TableLayout";
import AdminToast from "../../admin/components/AdminToast";
import { providerServiceColumns } from "../../helper/tableColumn";
import { useLang } from "../../i18n/useLang";
import { deleteService, fetchProviderServices } from "../../api";
import {
  ADMIN_SERVICE_DEFAULT_SORTING,
  getAdminServiceText,
  mapAdminServiceSortingToApiQuery,
} from "../../admin/utils/adminServicePage";

const UI_TEXT = {
  en: {
    draftTitle: "Local draft",
    draftSubtitle: "Your unfinished service draft is still stored in this browser.",
    noDraftTitle: "No local draft",
    noDraftSubtitle: "Start a new service to create your first draft.",
    createService: "Create service",
    refreshDraft: "Refresh draft",
    draftCount: "Draft count",
    draftRefreshed: "Draft refreshed.",
    deleteConfirm: "Delete this service?",
    deleteSuccess: "Service deleted.",
    deleteError: "Unable to delete this service right now.",
    toastSuccessTitle: "Success",
    toastErrorTitle: "Error",
  },
  km: {
    draftTitle: "ព្រាងក្នុងឧបករណ៍",
    draftSubtitle: "ព្រាងសេវាកម្មដែលមិនទាន់បញ្ចប់របស់អ្នកនៅតែរក្សាទុកក្នុង browser នេះ។",
    noDraftTitle: "មិនមានព្រាងក្នុងឧបករណ៍",
    noDraftSubtitle: "ចាប់ផ្តើមសេវាកម្មថ្មីមួយ ដើម្បីបង្កើតព្រាងដំបូងរបស់អ្នក។",
    createService: "បង្កើតសេវាកម្ម",
    refreshDraft: "ផ្ទុកព្រាងឡើងវិញ",
    draftCount: "ចំនួនព្រាង",
    draftRefreshed: "បានផ្ទុកព្រាងឡើងវិញ។",
    deleteConfirm: "លុបសេវាកម្មនេះមែនទេ?",
    deleteSuccess: "បានលុបសេវាកម្ម។",
    deleteError: "មិនអាចលុបសេវាកម្មនេះបានទេ។",
    toastSuccessTitle: "ជោគជ័យ",
    toastErrorTitle: "បរាជ័យ",
  },
};

function readStoredJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDraftFromStorage() {
  const payload = readStoredJson("apsor:uploadServicePayload");

  if (!payload || typeof payload !== "object") return null;

  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
  };
}

export default function ProviderServiceManagePage() {
  const { lang } = useLang("km");
  const tableText = useMemo(() => ({
    ...getAdminServiceText(lang),
    services: lang === "km" ? "សេវាកម្មរបស់ខ្ញុំ" : "My Services",
    searchPlaceholder: lang === "km" ? "ស្វែងរកសេវាកម្មរបស់អ្នក" : "Search your services",
    emptyMessage: lang === "km" ? "មិនមានសេវាកម្មរបស់អ្នកត្រូវនឹងការស្វែងរកនេះទេ។" : "No provider services match this search.",
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    preview: lang === "km" ? "មើល" : "Preview",
    serviceLocation: lang === "km" ? "ទីតាំងសេវាកម្ម" : "Service Location",
  }), [lang]);
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [sorting, setSorting] = useState(ADMIN_SERVICE_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [draftService, setDraftService] = useState(() => getDraftFromStorage());
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
      const result = await fetchProviderServices(serviceQuery);
      setServices(result.items);
      setTotalRows(result.totalElements);
    } catch (error) {
      console.error("Failed to fetch provider services:", error);
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

  const handleRefreshDraft = useCallback(() => {
    setDraftService(getDraftFromStorage());
    setMessage(text.draftRefreshed);
  }, [text.draftRefreshed]);

  const showToast = useCallback((type, messageText) => {
    setToast({
      type,
      title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
      message: messageText,
    });
  }, [text.toastErrorTitle, text.toastSuccessTitle]);

  const handleDeleteService = useCallback(async (service) => {
    const serviceId = service?.id;
    if (!serviceId) return;

    const shouldDelete = window.confirm(text.deleteConfirm);
    if (!shouldDelete) return;

    setMessage("");

    try {
      await deleteService(serviceId);
      setServices((current) => current.filter((item) => item?.id !== serviceId));
      setTotalRows((current) => Math.max(0, current - 1));
      showToast("success", text.deleteSuccess);
    } catch (error) {
      console.error("Failed to delete provider service:", error);
      showToast("error", text.deleteError);
    }
  }, [showToast, text.deleteConfirm, text.deleteError, text.deleteSuccess]);

  const columns = useMemo(
    () => providerServiceColumns({ text: tableText, onDelete: handleDeleteService }),
    [handleDeleteService, tableText],
  );

  return (
    <section className="space-y-4">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-2xl border border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{tableText.services}</h1>
            <p className="mt-1 text-sm text-text-secondary">{text.draftSubtitle}</p>
          </div>

          <Link
            to="/upload-service"
            className="inline-flex h-10 items-center gap-2 rounded-pill border border-brand/45 bg-linear-to-r from-brand-soft/65 to-bg-surface px-4 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft/80"
          >
            <Plus className="h-4 w-4" />
            {text.createService}
          </Link>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-bg-subtle/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">{text.draftTitle}</p>
              <p className="mt-1 text-xs text-text-muted">
                {draftService ? (draftService.title || draftService.description || text.draftSubtitle) : text.noDraftSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshDraft}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {text.refreshDraft}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary">
              <FolderOpenDot className="h-3.5 w-3.5 text-brand" />
              {`${text.draftCount}: ${draftService ? 1 : 0}`}
            </span>
            {message ? <span className="text-xs font-medium text-success">{message}</span> : null}
          </div>
        </div>
      </section>

      <TableLayout
        columns={columns}
        data={services}
        isLoading={isLoading}
        title={tableText.services}
        searchPlaceholder={tableText.searchPlaceholder}
        emptyMessage={tableText.emptyMessage}
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
