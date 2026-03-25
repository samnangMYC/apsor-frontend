import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AdminSelect from "./AdminSelect";

function SortIcon({ sorted }) {
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5" />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5" />;
  return <ArrowUpDown className="h-3.5 w-3.5" />;
}

function SkeletonBar({ className = "" }) {
  return (
    <span
      className={`inline-flex animate-pulse rounded-full bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
      aria-hidden="true"
    />
  );
}

export default function TableLayout({
  columns,
  data,
  title,
  subtitle,
  headerAction = null,
  searchPlaceholder = "Search",
  emptyMessage = "No results found.",
  initialPageSize = 10,
  isLoading = false,
  skeletonRows = 6,
  searchValue,
  onSearchChange,
  controlledPagination,
  onControlledPaginationChange,
  controlledSorting,
  onControlledSortingChange,
  pageCount,
  totalRows,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  toolbarContent = null,
}) {
  const { lang } = useLang("km");
  const [internalSorting, setInternalSorting] = useState([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const globalFilter = searchValue ?? internalGlobalFilter;
  const pagination = controlledPagination ?? internalPagination;
  const sorting = controlledSorting ?? internalSorting;
  const setGlobalFilter = onSearchChange ?? setInternalGlobalFilter;
  const setPagination = onControlledPaginationChange ?? setInternalPagination;
  const setSorting = onControlledSortingChange ?? setInternalSorting;

  // TanStack Table manages imperative table helpers internally.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount,
    enableSortingRemoval: false,
  });

  const pageCountLabel = useMemo(() => {
    const resolvedTotalRows = totalRows ?? table.getFilteredRowModel().rows.length;
    const ofLabel = lang === "km" ? "នៃ" : "of";
    if (!resolvedTotalRows) return `0 ${ofLabel} 0`;

    const start = pagination.pageIndex * pagination.pageSize + 1;
    const end = Math.min(resolvedTotalRows, start + pagination.pageSize - 1);
    return `${start}-${end} ${ofLabel} ${resolvedTotalRows}`;
  }, [lang, pagination.pageIndex, pagination.pageSize, table, totalRows]);

  const scrollHint = lang === "km"
    ? "អូសផ្តេកដើម្បីមើលតារាងទាំងមូល"
    : "Scroll horizontally to view the full table";

  return (
    <section className="min-w-0 rounded-xl border border-border bg-bg-surface shadow-1">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-4 sm:py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold line-clamp-1 text-text-primary sm:text-lg">{title}</h3>
          {subtitle ? (
            <p className="mt-1 max-w-2xl break-words text-xs leading-5 text-text-secondary sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <label className="relative block w-full xl:max-w-[280px] xl:min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-border bg-bg-surface pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          {toolbarContent ? (
            <div className="w-full min-w-0">
              {toolbarContent}
            </div>
          ) : null}
          {headerAction ? (
            <div className="w-full xl:w-auto">
              {headerAction}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-b border-border bg-bg-subtle/30 px-3 py-2 text-[11px] text-text-muted sm:hidden">
        {scrollHint}
      </div>

      <div className="min-w-0 overflow-hidden">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[980px] border-separate border-spacing-0">
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-bg-subtle/70">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const headerClassName = header.column.columnDef.meta?.headerClassName || "";

                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-2.5 text-center align-middle text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:px-4 sm:py-3 sm:text-xs ${headerClassName}`}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex w-full items-center justify-center gap-1.5 text-center transition hover:text-brand"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            </thead>
            <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-row-${rowIndex + 1}`}
                  className={`${rowIndex % 2 === 0 ? "bg-bg-surface" : "bg-bg-subtle/35"}`}
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={`${column.id || column.accessorKey || "column"}-${columnIndex + 1}`}
                      className="border-t border-border px-3 py-3 text-center align-middle sm:px-4 sm:py-4"
                    >
                      <div className="flex items-center justify-center">
                        <SkeletonBar
                          className={`h-4 ${
                            columnIndex === 0
                              ? "w-10"
                              : columnIndex === columns.length - 1
                                ? "w-28 sm:w-40"
                                : "w-20 sm:w-28"
                          }`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`transition ${rowIndex % 2 === 0 ? "bg-bg-surface" : "bg-bg-subtle/35"} hover:bg-brand-soft/30`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellClassName = cell.column.columnDef.meta?.cellClassName || "";

                    return (
                      <td
                        key={cell.id}
                        className={`border-t border-border px-3 py-3 text-center align-middle text-xs text-text-secondary sm:px-4 sm:py-4 sm:text-sm ${cellClassName}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-t border-border px-4 py-10 text-center text-sm text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-border bg-bg-surface px-3 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-xs text-text-secondary sm:text-sm">
          {isLoading ? <SkeletonBar className="h-4 w-24" /> : pageCountLabel}
        </p>

        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <AdminSelect
            value={pagination.pageSize}
            onChange={(event) => setPagination((current) => ({
              ...current,
              pageIndex: 0,
              pageSize: Number(event.target.value),
            }))}
            className="h-9 min-w-[104px] rounded-lg py-0 pl-3 pr-9 text-xs text-text-secondary sm:text-sm"
            iconClassName="h-3.5 w-3.5"
            aria-label={lang === "km" ? "ចំនួនជួរដេកក្នុងមួយទំព័រ" : "Rows per page"}
            disabled={isLoading}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {lang === "km" ? `${size} / ទំព័រ` : `${size} / page`}
              </option>
            ))}
          </AdminSelect>

          <button
            type="button"
            onClick={() => setPagination((current) => ({
              ...current,
              pageIndex: Math.max(0, current.pageIndex - 1),
            }))}
            disabled={isLoading || pagination.pageIndex <= 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={lang === "km" ? "ទំព័រមុន" : "Previous page"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPagination((current) => ({
              ...current,
              pageIndex: current.pageIndex + 1,
            }))}
            disabled={isLoading || (manualPagination
              ? pagination.pageIndex + 1 >= (pageCount ?? 0)
              : !table.getCanNextPage())}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={lang === "km" ? "ទំព័របន្ទាប់" : "Next page"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
