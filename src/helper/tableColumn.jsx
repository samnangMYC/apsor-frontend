import { useState } from "react";
import { ImageOff, ImagePlus, PencilLine, Trash2 } from "lucide-react";
import { formatAdminDate } from "../admin/utils/categoryAdmin";

const editActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800";
const imageActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800";
const deleteActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800";
const softDeleteActionButtonClassName =
  "group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800";

function CategoryImageCell({ imageUrl, alt }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!imageUrl || hasImageError) {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-subtle text-text-muted sm:h-14 sm:w-14">
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
}

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
      size: 112,
      meta: {
        headerClassName: "w-28 min-w-[7rem]",
        cellClassName: "w-28 min-w-[7rem]",
      },
      cell: ({ row }) => (
        <CategoryImageCell
          imageUrl={row.original.imageUrl}
          alt={row.original.name?.[lang] || row.original.name?.en || text.categories}
        />
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "name",
      header: text.name,
      accessorFn: (row) => `${row.name?.en || ""} ${row.name?.km || ""}`,
      enableSorting: false,
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
      enableSorting: false,
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
        <span
          className={`inline-flex rounded-pill px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${row.original.status === "ACTIVE"
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger"
            }`}
        >
          {row.original.status === "ACTIVE"
            ? text.statusActive
            : row.original.status === "INACTIVE"
              ? text.statusInactive || "INACTIVE"
              : row.original.status || "--"}
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

export function adminSubcategoryColumns({
  lang,
  text,
  resolveCategoryName,
  onEdit,
  onDelete,
}) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      accessorKey: "categoryId",
      header: text.categoryId,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs font-medium text-text-primary sm:max-w-[220px] sm:text-sm"
          title={resolveCategoryName?.(row.original.categoryId) || "--"}
        >
          {resolveCategoryName?.(row.original.categoryId) || "--"}
        </p>
      ),
    },
    {
      id: "name",
      header: text.name,
      accessorFn: (row) => `${row.name?.en || ""} ${row.name?.km || ""}`,
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs font-semibold text-text-primary sm:max-w-[240px] sm:text-sm"
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
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[200px] truncate text-xs text-text-primary sm:max-w-[300px] sm:text-sm"
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
      cell: ({ row }) => {
        const isDeleted = Boolean(row.original.deletedAt);
        const statusClassName = isDeleted
          ? "bg-warning/15 text-warning"
          : row.original.status === "ACTIVE"
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger";
        const statusLabel = isDeleted
          ? text.statusDeleted || "Deleted"
          : row.original.status === "ACTIVE"
            ? text.statusActive
            : row.original.status === "INACTIVE"
              ? text.statusInactive || "INACTIVE"
              : row.original.status || "--";

        return (
          <span className={`inline-flex rounded-pill px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${statusClassName}`}>
            {statusLabel}
          </span>
        );
      },
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

export function adminUserColumns({ text, onEdit, onSoftDelete, onHardDelete }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      accessorKey: "username",
      header: text.username,
      cell: ({ row }) => row.original.username || "--",
    },
    {
      id: "fullName",
      header: text.fullName,
      accessorFn: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim(),
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs font-semibold text-text-primary sm:max-w-[240px] sm:text-sm"
          title={`${row.original.firstName || ""} ${row.original.lastName || ""}`.trim() || "--"}
        >
          {`${row.original.firstName || ""} ${row.original.lastName || ""}`.trim() || "--"}
        </p>
      ),
    },
    {
      accessorKey: "email",
      header: text.email,
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate" title={row.original.email || "--"}>
          {row.original.email || "--"}
        </p>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: text.phoneNumber,
      cell: ({ row }) => row.original.phoneNumber || "--",
    },
    {
      accessorKey: "userType",
      header: text.userType,
      cell: ({ row }) => row.original.userType || "--",
    },
    {
      accessorKey: "status",
      header: text.status,
      cell: ({ row }) => {
        const status = row.original.status;
        const statusClassName = status === "ACTIVE"
          ? "bg-success/10 text-success"
          : status === "SUSPENDED"
            ? "bg-warning/15 text-warning"
            : "bg-danger/10 text-danger";
        const statusLabel = status === "ACTIVE"
          ? text.statusActive
          : status === "SUSPENDED"
            ? text.statusSuspended || "Suspended"
            : status === "DELETED"
              ? text.statusDeleted || "Deleted"
              : status || "--";

        return (
          <span className={`inline-flex rounded-pill px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${statusClassName}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: text.lastLoginAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.lastLoginAt, "en")}>
          {formatAdminDate(row.original.lastLoginAt, "en")}
        </span>
      ),
    },
    {
      accessorKey: "lastSeenAt",
      header: text.lastSeenAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.lastSeenAt, "en")}>
          {formatAdminDate(row.original.lastSeenAt, "en")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: text.createdAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          {formatAdminDate(row.original.createdAt, "en")}
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
              onClick={() => onSoftDelete(row.original.id)}
              className={softDeleteActionButtonClassName}
              aria-label={text.softDelete}
              title={text.softDelete}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <Trash2 className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.softDelete}</span>
            </button>
            <button
              type="button"
              onClick={() => onHardDelete(row.original.id)}
              className={deleteActionButtonClassName}
              aria-label={text.hardDelete}
              title={text.hardDelete}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <Trash2 className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.hardDelete}</span>
            </button>
          </div>
        </div>
      ),
    },
  ];
}

export function adminCustomerColumns({ text }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.user.email || "--",
    },
    {
      accessorKey: "bio",
      header: text.bio,
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate" title={row.original.bio || "--"}>
          {row.original.bio || "--"}
        </p>
      ),
    },
    {
      accessorKey: "dob",
      header: text.dob,
      cell: ({ row }) => row.original.dob || "--",
    },
    {
      accessorKey: "gender",
      header: text.gender,
      cell: ({ row }) => row.original.gender || "--",
    },
    {
      accessorKey: "preferredLanguage",
      header: text.preferredLanguage,
      cell: ({ row }) =>
        row.original.preferredLanguage || "--",
    },
    {
      accessorKey: "createdAt",
      header: text.createdAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          {formatAdminDate(row.original.createdAt, "en")}
        </span>
      ),
    },
  ];
}

export function adminProviderColumns({ text }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.user.email || "--",
    },
    {
      accessorKey: "bio",
      header: text.bio,
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate" title={row.original.bio || "--"}>
          {row.original.bio || "--"}
        </p>
      ),
    },
    {
      accessorKey: "businessName",
      header: text.businessName,
      cell: ({ row }) => row.original.businessName || "--",
    },
    {
      accessorKey: "displayName",
      header: text.displayName,
      cell: ({ row }) => row.original.displayName || "--",
    },
    {
      accessorKey: "businessType",
      header: text.businessType,
      cell: ({ row }) =>
        row.original.businessType || "--",
    },
    {
      accessorKey: "establishedAt",
      header: text.establishedAt,
      cell: ({ row }) =>
        row.original.establishedAt || "--",
    },
    {
      accessorKey: "facebookUrl",
      header: text.facebookUrl,
      cell: ({ row }) => {
        const url = row.original.facebookUrl;

        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {url}
          </a>
        ) : (
          "--"
        );
      },
    },
    {
      accessorKey: "telegram",
      header: text.telegram,
      cell: ({ row }) => {
        const url = row.original.telegram;

        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            {url}
          </a>
        ) : (
          "--"
        );
      },
    },
    {
      accessorKey: "websiteUrl",
      header: text.websiteUrl,
      cell: ({ row }) => {
        const url = row.original.websiteUrl;

        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            {url}
          </a>
        ) : (
          "--"
        );
      },
    },

    {
      accessorKey: "status",
      header: text.status,
      cell: ({ row }) => {
        const status = row.original.status;

        const statusConfig = {
          DRAFT: {
            label: "Draft",
            className: "bg-gray-100 text-gray-700",
          },
          PENDING_VERIFICATION: {
            label: "Pending Verification",
            className: "bg-yellow-100 text-yellow-700",
          },
          ACTIVE: {
            label: "Active",
            className: "bg-green-100 text-green-700",
          },
          REJECTED: {
            label: "Rejected",
            className: "bg-red-100 text-red-700",
          },
          SUSPENDED: {
            label: "Suspended",
            className: "bg-orange-100 text-orange-700",
          },
          INACTIVE: {
            label: "Inactive",
            className: "bg-slate-100 text-slate-700",
          },
        };

        const config = statusConfig[status];

        return config ? (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        ) : (
          "--"
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: text.createdAt,
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          {formatAdminDate(row.original.createdAt, "en")}
        </span>
      ),
    },
  ];
}
