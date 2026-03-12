export const ADMIN_SUBCATEGORY_ALL_STATUS = "ALL";
export const ADMIN_SUBCATEGORY_DEFAULT_SORTING = [{ id: "id", desc: true }];

export function mapAdminSubcategorySortingToApiQuery(sorting) {
  const primarySort = sorting[0];
  const sortMap = {
    id: "id",
    categoryId: "categoryId",
    slug: "slug",
    sortOrder: "sortOrder",
    status: "status",
  };

  return {
    sortBy: sortMap[primarySort?.id] ?? "id",
    sortOrder: primarySort?.desc === false ? "asc" : "desc",
  };
}

export function getAdminSubcategoryText(lang, t) {
  return {
    id: "ID",
    categoryId: lang === "km" ? "ឈ្មោះប្រភេទមេ" : "Category Name",
    name: lang === "km" ? "ឈ្មោះ" : "Name",
    slug: t.slug || "Slug",
    description: lang === "km" ? "ការពិពណ៌នា" : "Description",
    sort: lang === "km" ? "លំដាប់" : "Sort",
    status: lang === "km" ? "ស្ថានភាព" : "Status",
    subcategories: t.subcategories || "Subcategories",
    searchPlaceholder: lang === "km" ? "ស្វែងរកប្រភេទរង" : "Search subcategories",
    emptyMessage: lang === "km" ? "មិនមានប្រភេទរងត្រូវនឹងការស្វែងរកនេះទេ។" : "No subcategories match this search.",
    filterAllStatuses: lang === "km" ? "ស្ថានភាពទាំងអស់" : "All statuses",
    statusActive: t.active || "Active",
    statusInactive: lang === "km" ? "អសកម្ម" : "Inactive",
  };
}
