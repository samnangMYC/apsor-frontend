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
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    edit: t.edit || "Edit",
    delete: t.delete || "Delete",
    update: lang === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Update",
    close: lang === "km" ? "បិទ" : "Close",
    editSubcategory: lang === "km" ? "កែប្រែប្រភេទរង" : "Edit subcategory",
    requestFailed: lang === "km" ? "សំណើបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។" : "Request failed. Please try again.",
    validationRequired: lang === "km" ? "សូមបំពេញវាលនេះ។" : "This field is required.",
    validationSortRequired: lang === "km" ? "សូមបញ្ចូលលំដាប់។" : "Sort is required.",
    validationSort: lang === "km" ? "លំដាប់ត្រូវតែជាចំនួនគត់ស្មើ ឬ ធំជាង 0។" : "Sort must be a whole number greater than or equal to 0.",
    deleteConfirm: lang === "km" ? "តើអ្នកពិតជាចង់លុបប្រភេទរងនេះមែនទេ?" : "Are you sure you want to delete this subcategory?",
    deleteTitle: lang === "km" ? "បញ្ជាក់ការលុប" : "Confirm deletion",
    statusActive: t.active || "Active",
    statusInactive: lang === "km" ? "អសកម្ម" : "Inactive",
  };
}
