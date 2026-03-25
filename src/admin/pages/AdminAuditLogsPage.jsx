import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import TableLayout from "../components/TableLayout";
import { useLang } from "../../i18n/useLang";
import { fetchAuditLogs } from "../../api";
import { formatAdminDate } from "../utils/categoryAdmin";

const DEFAULT_SORTING = [{ id: "occurredAt", desc: true }];
const ACTION_OPTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "SOFT_DELETE",
  "VIEW",
  "SIGN_IN",
  "SIGN_UP",
  "SIGN_OUT",
  "APPROVE",
  "REJECT",
  "CHANGE_STATUS",
  "CHANGE_PASSWORD",
  "CUSTOM",
];
const RESOURCE_OPTIONS = ["USER", "CUSTOMER", "PROVIDER", "SERVICE", "CATEGORY", "SUBCATEGORY", "ORDER"];

function getText(lang) {
  return {
    title: lang === "km" ? "កំណត់ហេតុសកម្មភាព" : "Audit logs",
    subtitle: lang === "km"
      ? "តាមដានសកម្មភាពរបស់អ្នកប្រើក្នុងប្រព័ន្ធ និងត្រងតាម user, action, resource និងកាលបរិច្ឆេទ។"
      : "Review user activity across the system and filter by user, action, resource, and date range.",
    searchPlaceholder: lang === "km" ? "ស្វែងរកដោយ username" : "Search by username",
    emptyMessage: lang === "km" ? "មិនមានកំណត់ហេតុសកម្មភាពទេ។" : "No audit logs found.",
    userId: lang === "km" ? "លេខសម្គាល់អ្នកប្រើ" : "User ID",
    resourceType: lang === "km" ? "ប្រភេទ resource" : "Resource type",
    from: lang === "km" ? "ចាប់ពី" : "From",
    to: lang === "km" ? "ដល់" : "To",
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    apply: lang === "km" ? "អនុវត្តតម្រង" : "Apply filters",
    reset: lang === "km" ? "កំណត់ឡើងវិញ" : "Reset",
    refresh: lang === "km" ? "ផ្ទុកឡើងវិញ" : "Refresh",
    occurredAt: lang === "km" ? "ពេលកើតឡើង" : "Occurred at",
    details: lang === "km" ? "ព័ត៌មានលម្អិត" : "Details",
    action: lang === "km" ? "សកម្មភាព" : "Action",
    resource: lang === "km" ? "Resource" : "Resource",
    actor: lang === "km" ? "អ្នកប្រើ" : "Actor",
    noValue: "--",
    requestFailed: lang === "km" ? "មិនអាចផ្ទុកកំណត់ហេតុសកម្មភាពបានទេ។" : "Failed to load audit logs.",
    allResources: lang === "km" ? "គ្រប់ resource" : "All resources",
  };
}

function toUtcIsoString(dateTimeLocalValue) {
  if (!dateTimeLocalValue) return "";

  const date = new Date(dateTimeLocalValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

function ActionChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold tracking-[0.08em] transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-bg-surface text-text-secondary hover:border-brand/35 hover:text-brand"
      }`}
    >
      {label}
    </button>
  );
}

export default function AdminAuditLogsPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getText(lang), [lang]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    userId: "",
    username: "",
    actions: [],
    resourceType: "",
    from: "",
    to: "",
  });
  const [draftFilters, setDraftFilters] = useState({
    userId: "",
    actions: [],
    resourceType: "",
    from: "",
    to: "",
  });
  const [sorting, setSorting] = useState(DEFAULT_SORTING);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        username: searchValue.trim(),
      }));
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const query = useMemo(() => ({
    userId: filters.userId.trim(),
    username: filters.username.trim(),
    actions: filters.actions,
    resourceType: filters.resourceType,
    from: toUtcIsoString(filters.from),
    to: toUtcIsoString(filters.to),
    pageNumber: pagination.pageIndex,
    pageSize: pagination.pageSize,
  }), [filters, pagination.pageIndex, pagination.pageSize]);

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await fetchAuditLogs(query);
      setAuditLogs(result.items || []);
      setTotalRows(result.totalElements ?? 0);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setAuditLogs([]);
      setTotalRows(0);
      setErrorMessage(
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.requestFailed,
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, text.requestFailed]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : DEFAULT_SORTING;
    });
  }, []);

  const toggleAction = useCallback((action) => {
    setDraftFilters((current) => ({
      ...current,
      actions: current.actions.includes(action)
        ? current.actions.filter((item) => item !== action)
        : [...current.actions, action],
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters((current) => ({
      ...current,
      userId: draftFilters.userId,
      actions: draftFilters.actions,
      resourceType: draftFilters.resourceType,
      from: draftFilters.from,
      to: draftFilters.to,
    }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setSearchValue("");
    setDraftFilters({
      userId: "",
      actions: [],
      resourceType: "",
      from: "",
      to: "",
    });
    setFilters({
      userId: "",
      username: "",
      actions: [],
      resourceType: "",
      from: "",
      to: "",
    });
    setSorting(DEFAULT_SORTING);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const columns = useMemo(() => ([
    {
      accessorKey: "occurredAt",
      header: text.occurredAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[180px] truncate whitespace-nowrap font-medium text-text-primary" title={formatAdminDate(row.original.occurredAt, lang)}>
          {formatAdminDate(row.original.occurredAt, lang)}
        </span>
      ),
      meta: {
        headerClassName: "min-w-[12rem]",
        cellClassName: "min-w-[12rem]",
      },
    },
    {
      accessorKey: "action",
      header: text.action,
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-brand">
          {row.original.action || text.noValue}
        </span>
      ),
      meta: {
        headerClassName: "min-w-[8rem]",
        cellClassName: "min-w-[8rem]",
      },
    },
    {
      id: "resource",
      header: text.resource,
      accessorFn: (row) => `${row.resourceType || ""} ${row.resourceId || ""}`,
      cell: ({ row }) => (
        <div className="space-y-1 text-left">
          <p className="text-sm font-semibold text-text-primary">{row.original.resourceType || text.noValue}</p>
          <p className="text-xs text-text-secondary">{row.original.resourceId || text.noValue}</p>
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: "min-w-[10rem]",
        cellClassName: "min-w-[10rem]",
      },
    },
    {
      id: "actor",
      header: text.actor,
      accessorFn: (row) => `${row.username || ""} ${row.userId || ""}`,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="space-y-1 text-left">
          <p className="text-sm font-semibold text-text-primary">{row.original.username || text.noValue}</p>
          <p className="max-w-[220px] truncate text-xs text-text-secondary" title={row.original.userId || text.noValue}>
            {row.original.userId || text.noValue}
          </p>
        </div>
      ),
      meta: {
        headerClassName: "min-w-[14rem]",
        cellClassName: "min-w-[14rem]",
      },
    },
    {
      accessorKey: "details",
      header: text.details,
      enableSorting: false,
      cell: ({ row }) => (
        <p className="max-w-[360px] text-left text-sm leading-6 text-text-secondary">
          {row.original.details || text.noValue}
        </p>
      ),
      meta: {
        headerClassName: "min-w-[22rem]",
        cellClassName: "min-w-[22rem]",
      },
    },
  ]), [lang, text]);

  const toolbarContent = (
    <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-border bg-bg-subtle/30 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.userId}</span>
          <input
            type="text"
            value={draftFilters.userId}
            onChange={(event) => setDraftFilters((current) => ({ ...current, userId: event.target.value }))}
            placeholder={text.userId}
            className="h-10 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.resourceType}</span>
          <select
            value={draftFilters.resourceType}
            onChange={(event) => setDraftFilters((current) => ({ ...current, resourceType: event.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">{text.allResources}</option>
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.from}</span>
          <input
            type="datetime-local"
            value={draftFilters.from}
            onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.to}</span>
          <input
            type="datetime-local"
            value={draftFilters.to}
            onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.actions}</p>
          <div className="flex flex-wrap gap-2">
            {ACTION_OPTIONS.map((action) => (
              <ActionChip
                key={action}
                label={action}
                active={draftFilters.actions.includes(action)}
                onClick={() => toggleAction(action)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 2xl:flex 2xl:flex-wrap">
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {text.apply}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand"
          >
            {text.reset}
          </button>
          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={isLoading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {text.refresh}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-danger/25 bg-danger/8 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="min-w-0 space-y-4">
      <TableLayout
        columns={columns}
        data={auditLogs}
        isLoading={isLoading}
        title={text.title}
        subtitle={text.subtitle}
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
        manualSorting={false}
        manualFiltering
        toolbarContent={toolbarContent}
      />
    </section>
  );
}
