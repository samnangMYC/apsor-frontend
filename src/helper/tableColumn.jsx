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

function ProviderAvatarCell({ imageUrl, alt }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!imageUrl || hasImageError) {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted sm:h-14 sm:w-14">
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
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
      meta: {
        headerClassName: "w-16 min-w-[4rem]",
        cellClassName: "w-16 min-w-[4rem]",
      },
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

export function adminCustomerColumns({ text, onEdit, onDelete }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: {
        headerClassName: "min-w-[11rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[11rem]",
      },
      cell: ({ row }) => row.original.user?.email || "--",
    },
    {
      accessorKey: "bio",
      header: text.bio,
      meta: {
        headerClassName: "min-w-[10rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[10rem]",
      },
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate" title={row.original.bio || "--"}>
          {row.original.bio || "--"}
        </p>
      ),
    },
    {
      accessorKey: "dob",
      header: text.dob,
      cell: ({ row }) =>
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          {row.original.dob || "--"}
        </span>

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
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          row.original.preferredLanguage || "--",
        </span>

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
        headerClassName: "text-center ",
        cellClassName: "align-middle whitespace-nowrap",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="inline-flex flex-nowrap items-center justify-center gap-1 rounded-2xl p-1 sm:gap-2 sm:p-1.5">
            <button
              type="button"
              onClick={() => onEdit?.(row.original)}
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
              onClick={() => onDelete?.(row.original)}
              className={deleteActionButtonClassName}
              aria-label={text.hardDelete || text.delete}
              title={text.hardDelete || text.delete}
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

export function adminProviderColumns({ text, onEdit, onDelete, onUploadAvatar }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      id: "avatar",
      header: text.image || "Image",
      size: 112,
      meta: {
        headerClassName: "w-28 min-w-[7rem]",
        cellClassName: "w-28 min-w-[7rem] text-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ProviderAvatarCell
            imageUrl={row.original.avatarUrl}
            alt={row.original.displayName || row.original.user?.email || "Provider"}
          />
        </div>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.user?.email || "--",
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
      meta: {
        headerClassName: "min-w-[10rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[10rem]",
      },
      cell: ({ row }) => row.original.businessName || "--",
    },
    {
      accessorKey: "displayName",
      header: text.displayName,
      meta: {
        headerClassName: "min-w-[9rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[9rem]",
      },
      cell: ({ row }) => row.original.displayName || "--",
    },
    {
      accessorKey: "businessType",
      header: text.businessType,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) =>
        row.original.businessType || "--",
    },
    {
      accessorKey: "establishedAt",
      header: text.establishedAt,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) =>
        row.original.establishedAt || "--",
    },
    {
      accessorKey: "facebookUrl",
      header: text.facebookUrl,
      meta: {
        headerClassName: "min-w-[9rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[9rem]",
      },
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
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
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
      meta: {
        headerClassName: "min-w-[9rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[9rem]",
      },
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
      meta: {
        headerClassName: "min-w-[9rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[9rem]",
      },
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
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
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
        headerClassName: "min-w-[13rem] whitespace-normal text-center leading-tight",
        cellClassName: "min-w-[13rem] align-middle whitespace-nowrap",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="inline-flex flex-nowrap items-center justify-center gap-1 rounded-2xl p-1 sm:gap-2 sm:p-1.5">
            <button
              type="button"
              onClick={() => onEdit?.(row.original)}
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
              onClick={() => onUploadAvatar?.(row.original)}
              className={imageActionButtonClassName}
              aria-label={text.uploadAvatar}
              title={text.uploadAvatar}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <ImagePlus className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.uploadAvatar}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(row.original)}
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

export function adminServiceColumns({ text }) {
  return [
    {
      accessorKey: "id",
      header: text.id,
      meta: {
        headerClassName: "w-16 min-w-[4rem]",
        cellClassName: "w-16 min-w-[4rem]",
      },
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.id}</span>,
    },
    {
      id: "image",
      header: text.image,
      meta: {
        headerClassName: "w-28 min-w-[7rem]",
        cellClassName: "w-28 min-w-[7rem] text-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <CategoryImageCell
            imageUrl={row.original.imageUrl}
            alt={row.original.title || text.service}
          />
        </div>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: "title",
      header: text.title,
      meta: {
        headerClassName: "min-w-[12rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[12rem]",
      },
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate text-xs font-semibold text-text-primary sm:text-sm" title={row.original.title || "--"}>
          {row.original.title || "--"}
        </p>
      ),
    },
    {
      accessorKey: "description",
      header: text.description,
      meta: {
        headerClassName: "min-w-[14rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[14rem]",
      },
      enableSorting: false,
      cell: ({ row }) => (
        <p className="max-w-[260px] truncate text-xs text-text-primary sm:text-sm" title={row.original.description || "--"}>
          {row.original.description || "--"}
        </p>
      ),
    },
    {
      id: "provider",
      header: text.provider,
      accessorFn: (row) => row.provider?.displayName || row.provider?.businessName || row.provider?.user?.username || "",
      meta: {
        headerClassName: "min-w-[12rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[12rem]",
      },
      enableSorting: false,
      cell: ({ row }) => {
        const provider = row.original.provider;
        const providerName = provider?.displayName || provider?.businessName || provider?.user?.username || "--";
        const providerBusiness = provider?.businessName && provider?.businessName !== providerName
          ? provider.businessName
          : "";

        return (
          <div className="max-w-[220px]">
            <p className="truncate text-xs font-semibold text-text-primary sm:text-sm" title={providerName}>
              {providerName}
            </p>
            {providerBusiness ? (
              <p className="truncate text-[11px] text-text-secondary sm:text-xs" title={providerBusiness}>
                {providerBusiness}
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "providerEmail",
      header: text.providerEmail,
      accessorFn: (row) => row.provider?.user?.email || "",
      meta: {
        headerClassName: "min-w-[14rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[14rem]",
      },
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[240px] truncate text-xs text-text-primary sm:text-sm"
          title={row.original.provider?.user?.email || "--"}
        >
          {row.original.provider?.user?.email || "--"}
        </p>
      ),
    },
    {
      accessorKey: "locationMode",
      header: text.locationMode,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) => row.original.locationMode || "--",
    },
    {
      accessorKey: "status",
      header: text.status,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) => {
        const status = row.original.status;
        const statusClassName = status === "ACTIVE"
          ? "bg-success/10 text-success"
          : status === "SUSPENDED"
            ? "bg-warning/15 text-warning"
            : "bg-danger/10 text-danger";

        return (
          <span className={`inline-flex rounded-pill px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${statusClassName}`}>
            {status === "ACTIVE"
              ? text.statusActive
              : status === "SUSPENDED"
                ? text.statusSuspended
                : status === "INACTIVE"
                  ? text.statusInactive
                  : status || "--"}
          </span>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: text.publishedAt,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.publishedAt, "en")}>
          {formatAdminDate(row.original.publishedAt, "en")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: text.createdAt,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, "en")}>
          {formatAdminDate(row.original.createdAt, "en")}
        </span>
      ),
    },
  ];
}
