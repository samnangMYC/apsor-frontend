import { ImageOff, ImagePlus, PencilLine, Trash2 } from "lucide-react";
import { formatAdminDate } from "../admin/utils/categoryAdmin";

const editActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800";
const imageActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800";
const deleteActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800";

export function adminCategoryColumns({
  lang,
  text,
  onEdit,
  onEditImage,
  onDelete,
}) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      id: "image",
      header: text.image,
      cell: ({ row }) => (
        row.original.imageUrl ? (
          <img
            src={row.original.imageUrl}
            alt={row.original.name?.[lang] || row.original.name?.en || text.categories}
            className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle text-text-muted sm:h-12 sm:w-12">
            <ImageOff className="h-4 w-4" />
          </span>
        )
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "name",
      header: text.name,
      accessorFn: (row) => `${row.name?.en || ""} ${row.name?.km || ""}`,
      cell: ({ row }) => (
        <p
          className="max-w-[140px] truncate text-xs font-semibold text-text-primary sm:max-w-[220px] sm:text-sm"
          title={row.original.name?.[lang] || row.original.name?.en || "--"}
        >
          {row.original.name?.[lang] || row.original.name?.en || "--"}
        </p>
      ),
    },
    {
      accessorKey: "slug",
      header: text.slug,
      cell: ({ row }) => (
        <code
          className="inline-block max-w-[150px] truncate rounded-md bg-bg-subtle px-2 py-1 text-[11px] text-text-secondary sm:max-w-[220px] sm:text-xs"
          title={row.original.slug || "--"}
        >
          {row.original.slug || "--"}
        </code>
      ),
    },
    {
      id: "description",
      header: text.description,
      accessorFn: (row) => `${row.description?.en || ""} ${row.description?.km || ""}`,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs text-text-primary sm:max-w-[280px] sm:text-sm"
          title={row.original.description?.[lang] || row.original.description?.en || "--"}
        >
          {row.original.description?.[lang] || row.original.description?.en || "--"}
        </p>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: text.sort,
      cell: ({ row }) => row.original.sortOrder ?? "--",
    },
    {
      accessorKey: "status",
      header: text.status,
      cell: ({ row }) => (
        <span className="inline-flex rounded-pill bg-success/10 px-2 py-1 text-[11px] font-semibold text-success sm:px-2.5 sm:text-xs">
          {row.original.status === "ACTIVE" ? text.statusActive : (row.original.status || "--")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: text.created,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, lang)}>
          {formatAdminDate(row.original.createdAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: text.updated,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.updatedAt, lang)}>
          {formatAdminDate(row.original.updatedAt, lang)}
        </span>
      ),
    },
    {
      id: "actions",
      header: text.actions,
      enableSorting: false,
      enableGlobalFilter: false,
      meta: {
        headerClassName: "text-center",
        cellClassName: "align-middle whitespace-nowrap",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="inline-flex flex-nowrap items-center justify-center gap-1 rounded-2xl p-1 sm:gap-2 sm:p-1.5">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className={editActionButtonClassName}
              aria-label={text.edit}
              title={text.edit}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <PencilLine className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.edit}</span>
            </button>
            <button
              type="button"
              onClick={() => onEditImage(row.original)}
              className={imageActionButtonClassName}
              aria-label={text.imageAction}
              title={text.imageAction}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <ImagePlus className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.imageAction}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original.id)}
              className={deleteActionButtonClassName}
              aria-label={text.delete}
              title={text.delete}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <Trash2 className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.delete}</span>
            </button>
          </div>
        </div>
      ),
    },
  ];
}
