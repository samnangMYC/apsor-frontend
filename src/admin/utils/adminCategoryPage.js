export const ADMIN_CATEGORY_ALL_STATUS = "ALL";
export const ADMIN_CATEGORY_DEFAULT_SORTING = [{ id: "id", desc: true }];

export function getAdminCategoryApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  const candidates = [
    responseData?.message,
    responseData?.error,
    responseData?.detail,
    responseData?.data?.message,
  ];

  const message = candidates.find((value) => typeof value === "string" && value.trim());
  return message || fallbackMessage;
}

export function getAdminCategoryImageRecordTimestamp(item) {
  const timestamp =
    item?.media?.updatedAt
    || item?.media?.createdAt
    || item?.updatedAt
    || item?.createdAt
    || "";

  const value = new Date(timestamp).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function getAdminCategoryImageDeleteTargetId(item) {
  return item?.categoryMediaId ?? item?.media?.id ?? null;
}

export function getAdminCategoryActiveImage(images) {
  const sortedImages = [...images].sort((left, right) => {
    const timestampDelta =
      getAdminCategoryImageRecordTimestamp(right) - getAdminCategoryImageRecordTimestamp(left);

    if (timestampDelta !== 0) {
      return timestampDelta;
    }

    return (right?.categoryMediaId ?? right?.media?.id ?? 0)
      - (left?.categoryMediaId ?? left?.media?.id ?? 0);
  });

  return (
    sortedImages.find(
      (item) => item?.status === "ACTIVE" && (item?.categoryMediaId || item?.media?.id),
    )
    || sortedImages.find((item) => item?.categoryMediaId || item?.media?.id)
    || null
  );
}

export function mapAdminCategorySortingToApiQuery(sorting) {
  const primarySort = sorting[0];
  const sortMap = {
    id: "id",
    slug: "slug",
    sortOrder: "sortOrder",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  return {
    sortBy: sortMap[primarySort?.id] ?? "id",
    sortOrder: primarySort?.desc === false ? "asc" : "desc",
  };
}
