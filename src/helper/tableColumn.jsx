import { useState } from "react";
import { Eye, ImageOff, ImagePlus, PencilLine, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import AdminSelect from "../admin/components/AdminSelect";
import { formatAdminDate } from "../admin/utils/categoryAdmin";
import { getProviderProfileImage } from "../utils/provider";
import { getServicePath } from "../utils/service";

const editActionButtonClassName =
  "group inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800";
const imageActionButtonClassName =
  "group inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800";
const deleteActionButtonClassName =
  "group inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800";
const softDeleteActionButtonClassName =
  "group inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800";

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

function OrderStatusControl({
  order,
  text,
  onStatusChange,
  isUpdating = false,
}) {
  const [value, setValue] = useState(String(order?.status || "PENDING").toUpperCase());

  return (
    <AdminSelect
      value={value}
      disabled={isUpdating}
      onChange={(event) => {
        const nextValue = String(event.target.value || "PENDING").toUpperCase();
        setValue(nextValue);
        onStatusChange?.(order, nextValue);
      }}
      className="h-9 min-w-[148px] rounded-lg px-2.5 text-xs font-semibold"
      aria-label={text.changeStatus}
    >
      <option value="PENDING">{text.pending}</option>
      <option value="CONFIRMED">{text.confirmed}</option>
      <option value="IN_PROGRESS">{text.inProgress}</option>
      <option value="COMPLETED">{text.completed}</option>
      <option value="CANCELED">{text.canceled}</option>
    </AdminSelect>
  );
}

function ServiceStatusControl({
  service,
  text,
  onStatusChange,
  isUpdating = false,
}) {
  const [value, setValue] = useState(String(service?.status || "DRAFT").toUpperCase());

  return (
    <AdminSelect
      value={value}
      disabled={isUpdating}
      onChange={(event) => {
        const nextValue = String(event.target.value || "DRAFT").toUpperCase();
        setValue(nextValue);
        onStatusChange?.(service, nextValue);
      }}
      className="h-9 min-w-[148px] rounded-lg px-2.5 text-xs font-semibold"
      aria-label={text.changeStatus}
    >
      <option value="DRAFT">{text.statusDraft || "Draft"}</option>
      <option value="ACTIVE">{text.statusActive}</option>
      <option value="SUSPENDED">{text.statusSuspended}</option>
      <option value="ARCHIVED">{text.statusArchived || "Archived"}</option>
    </AdminSelect>
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

export function adminUserColumns({ text, currentUserId, onEdit, onSoftDelete, onHardDelete }) {
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
      cell: ({ row }) => {
        const isSelfUser = currentUserId != null && String(row.original.id) === String(currentUserId);
        const deleteButtonClassName = isSelfUser
          ? "group inline-flex cursor-not-allowed items-center gap-1 rounded-xl bg-slate-200 px-4 py-2.5 text-center text-sm font-medium leading-5 text-slate-500 opacity-80"
          : deleteActionButtonClassName;
        const softDeleteButtonClassName = isSelfUser
          ? "group inline-flex cursor-not-allowed items-center gap-1 rounded-xl bg-slate-200 px-4 py-2.5 text-center text-sm font-medium leading-5 text-slate-500 opacity-80"
          : softDeleteActionButtonClassName;

        return (
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
              className={softDeleteButtonClassName}
              aria-label={isSelfUser ? text.selfDeleteDisabled : text.softDelete}
              title={isSelfUser ? text.selfDeleteDisabled : text.softDelete}
              disabled={isSelfUser}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <Trash2 className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.softDelete}</span>
            </button>
            <button
              type="button"
              onClick={() => onHardDelete(row.original.id)}
              className={deleteButtonClassName}
              aria-label={isSelfUser ? text.selfDeleteDisabled : text.hardDelete}
              title={isSelfUser ? text.selfDeleteDisabled : text.hardDelete}
              disabled={isSelfUser}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
                <Trash2 className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">{text.hardDelete}</span>
            </button>
          </div>
        </div>
        );
      },
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

export function adminServiceColumns({ text, onStatusChange, updatingServiceId }) {
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
        headerClassName: "min-w-[10rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[10rem]",
      },
      cell: ({ row }) => (
        <ServiceStatusControl
          service={row.original}
          text={text}
          onStatusChange={onStatusChange}
          isUpdating={updatingServiceId === row.original.id}
        />
      ),
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

export function adminOrderColumns({
  text,
  lang,
  onStatusChange,
  updatingOrderId,
  showProvider = true,
}) {
  const columns = [
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
      accessorKey: "orderNo",
      header: text.orderNo,
      cell: ({ row }) => (
        <code className="inline-block max-w-[180px] truncate rounded-md bg-bg-subtle px-2 py-1 text-[11px] text-text-secondary sm:max-w-[220px] sm:text-xs">
          {row.original.orderNo || "--"}
        </code>
      ),
    },
    {
      id: "service",
      header: text.service,
      accessorFn: (row) => row?.service?.title || "",
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs font-semibold text-text-primary sm:max-w-[260px] sm:text-sm"
          title={row.original.service?.title || "--"}
        >
          {row.original.service?.title || "--"}
        </p>
      ),
    },
    {
      id: "provider",
      header: text.provider,
      accessorFn: (row) => row?.provider?.displayName || row?.provider?.businessName || "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-3">
          <ProviderAvatarCell
            imageUrl={getProviderProfileImage(row.original.provider) || ""}
            alt={row.original.provider?.displayName || row.original.provider?.businessName || text.provider}
          />
          <div className="min-w-0 text-left">
            <p
              className="max-w-[150px] truncate text-xs font-semibold text-text-primary sm:max-w-[220px] sm:text-sm"
              title={row.original.provider?.displayName || row.original.provider?.businessName || "--"}
            >
              {row.original.provider?.displayName || row.original.provider?.businessName || "--"}
            </p>
            <p className="max-w-[150px] truncate text-[11px] text-text-muted sm:max-w-[220px]">
              {row.original.provider?.user?.email || "--"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "customer",
      header: text.customer,
      accessorFn: (row) => `${row?.customer?.firstName || ""} ${row?.customer?.lastName || ""} ${row?.customer?.email || ""}`,
      enableSorting: false,
      cell: ({ row }) => {
        const customerName = `${row.original.customer?.firstName || ""} ${row.original.customer?.lastName || ""}`.trim();

        return (
          <div className="min-w-0 text-left">
            <p
              className="max-w-[160px] truncate text-xs font-semibold text-text-primary sm:max-w-[220px] sm:text-sm"
              title={customerName || row.original.customer?.username || "--"}
            >
              {customerName || row.original.customer?.username || "--"}
            </p>
            <p className="max-w-[160px] truncate text-[11px] text-text-muted sm:max-w-[220px]">
              {row.original.customer?.email || "--"}
            </p>
            <p className="max-w-[160px] truncate text-[11px] text-text-muted sm:max-w-[220px]">
              {row.original.customer?.phoneNumber || "--"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "units",
      header: text.units,
      cell: ({ row }) => row.original.units ?? "--",
    },
    {
      accessorKey: "subtotal",
      header: text.subtotal,
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {`${row.original.currency || "USD"} ${Number(row.original.subtotal || 0).toFixed(2)}`}
        </span>
      ),
    },
    {
      accessorKey: "discount",
      header: text.discount,
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {`${row.original.currency || "USD"} ${Number(row.original.discount || 0).toFixed(2)}`}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: text.total,
      cell: ({ row }) => (
        <span className="font-semibold text-text-primary">
          {`${row.original.currency || "USD"} ${Number(row.original.total || 0).toFixed(2)}`}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: text.status,
      cell: ({ row }) => {
        const status = String(row.original.status || "").toUpperCase();
        const statusClassName = status === "COMPLETED"
          ? "bg-success/10 text-success"
          : status === "CONFIRMED"
            ? "bg-brand/10 text-brand"
          : status === "IN_PROGRESS"
            ? "bg-info/10 text-info"
            : status === "CANCELED"
              ? "bg-danger/10 text-danger"
              : "bg-warning/10 text-warning";

        return (
          <span className={`inline-flex rounded-pill px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${statusClassName}`}>
            {status || "--"}
          </span>
        );
      },
    },
    {
      id: "statusAction",
      header: text.changeStatus,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <OrderStatusControl
            order={row.original}
            text={text}
            onStatusChange={onStatusChange}
            isUpdating={Number(updatingOrderId) === Number(row.original.id)}
          />
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: text.created,
      cell: ({ row }) => (
        <span className="inline-block max-w-[160px] truncate whitespace-nowrap" title={formatAdminDate(row.original.createdAt, lang)}>
          {formatAdminDate(row.original.createdAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: text.updated,
      cell: ({ row }) => (
        <span className="inline-block max-w-[160px] truncate whitespace-nowrap" title={formatAdminDate(row.original.updatedAt, lang)}>
          {formatAdminDate(row.original.updatedAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: "note",
      header: text.note,
      enableSorting: false,
      cell: ({ row }) => (
        <p
          className="max-w-[180px] truncate text-xs text-text-secondary sm:max-w-[260px] sm:text-sm"
          title={row.original.note || "--"}
        >
          {row.original.note || "--"}
        </p>
      ),
    },
  ];

  if (!onStatusChange) {
    return columns.filter((column) => (
      column.id !== "statusAction"
      && (showProvider || column.id !== "provider")
    ));
  }

  return showProvider ? columns : columns.filter((column) => column.id !== "provider");
}

export function providerServiceColumns({ text, onDelete, onStatusChange, updatingServiceId }) {
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
      id: "location",
      header: text.serviceLocation,
      accessorFn: (row) => row.location?.[0]?.city || row.location?.[0]?.district || "",
      meta: {
        headerClassName: "min-w-[10rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[10rem]",
      },
      enableSorting: false,
      cell: ({ row }) => (
        <p className="max-w-[220px] truncate text-xs text-text-primary sm:text-sm" title={row.original.location?.[0]?.city || row.original.location?.[0]?.district || "--"}>
          {row.original.location?.[0]?.city || row.original.location?.[0]?.district || "--"}
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
        headerClassName: "min-w-[10rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[10rem]",
      },
      cell: ({ row }) => (
        <ServiceStatusControl
          service={row.original}
          text={text}
          onStatusChange={onStatusChange}
          isUpdating={updatingServiceId === row.original.id}
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: text.updatedAt,
      meta: {
        headerClassName: "min-w-[8rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[8rem]",
      },
      cell: ({ row }) => (
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap" title={formatAdminDate(row.original.updatedAt || row.original.createdAt, "en")}>
          {formatAdminDate(row.original.updatedAt || row.original.createdAt, "en")}
        </span>
      ),
    },
    {
      id: "actions",
      header: text.actions,
      enableSorting: false,
      enableGlobalFilter: false,
      meta: {
        headerClassName: "min-w-[12rem] whitespace-normal leading-tight",
        cellClassName: "min-w-[12rem] whitespace-nowrap",
      },
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Link
            to={`/service/edit/${encodeURIComponent(row.original.id)}`}
            state={{ service: row.original }}
            className={editActionButtonClassName}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
              <PencilLine className="h-3 w-3" />
            </span>
            <span className="hidden sm:inline">{text.edit}</span>
          </Link>
          <Link
            to={getServicePath(row.original)}
            className="group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white transition hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white transition">
              <Eye className="h-3 w-3" />
            </span>
            <span className="hidden sm:inline">{text.preview}</span>
          </Link>
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
      ),
    },
  ];
}
