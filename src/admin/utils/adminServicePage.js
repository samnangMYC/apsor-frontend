export const ADMIN_SERVICE_DEFAULT_SORTING = [{ id: "id", desc: true }];

export function mapAdminServiceSortingToApiQuery(sorting) {
  const primarySort = sorting[0];
  const sortMap = {
    id: "id",
    title: "title",
    locationMode: "locationMode",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  return {
    sortBy: sortMap[primarySort?.id] ?? "id",
    sortOrder: primarySort?.desc === false ? "asc" : "desc",
  };
}

export function getAdminServiceText(lang) {
  return {
    id: "ID",
    services: lang === "km" ? "ការគ្រប់គ្រងសេវាកម្ម" : "Service Management",
    service: lang === "km" ? "សេវាកម្ម" : "Service",
    image: lang === "km" ? "រូបភាព" : "Image",
    title: lang === "km" ? "ចំណងជើង" : "Title",
    description: lang === "km" ? "ការពិពណ៌នា" : "Description",
    provider: lang === "km" ? "អ្នកផ្តល់សេវា" : "Provider",
    providerEmail: lang === "km" ? "អ៊ីមែលអ្នកផ្តល់សេវា" : "Provider Email",
    locationMode: lang === "km" ? "របៀបទីតាំង" : "Location Mode",
    publishedAt: lang === "km" ? "បោះពុម្ពនៅ" : "Published At",
    status: lang === "km" ? "ស្ថានភាព" : "Status",
    createdAt: lang === "km" ? "បង្កើតនៅ" : "Created At",
    updatedAt: lang === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Updated At",
    searchPlaceholder: lang === "km" ? "ស្វែងរកសេវាកម្ម" : "Search services",
    emptyMessage: lang === "km" ? "មិនមានសេវាកម្មត្រូវនឹងការស្វែងរកនេះទេ។" : "No services match this search.",
    changeStatus: lang === "km" ? "ប្តូរស្ថានភាព" : "Change status",
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    delete: lang === "km" ? "លុប" : "Delete",
    deleteTitle: lang === "km" ? "លុបសេវាកម្ម" : "Delete service",
    deleteConfirm: lang === "km" ? "តើអ្នកប្រាកដថាចង់លុបសេវាកម្មនេះមែនទេ?" : "Are you sure you want to delete this service?",
    deleteSuccess: lang === "km" ? "បានលុបសេវាកម្ម។" : "Service deleted.",
    deleteError: lang === "km" ? "មិនអាចលុបសេវាកម្មនេះបានទេ។" : "Unable to delete this service right now.",
    close: lang === "km" ? "បិទ" : "Close",
    statusActive: lang === "km" ? "សកម្ម" : "Active",
    statusInactive: lang === "km" ? "មិនសកម្ម" : "Inactive",
    statusDraft: lang === "km" ? "ព្រាង" : "Draft",
    statusSuspended: lang === "km" ? "ផ្អាក" : "Suspended",
    statusArchived: lang === "km" ? "បានទុកក្នុងបណ្ណសារ" : "Archived",
    toastSuccessTitle: lang === "km" ? "ជោគជ័យ" : "Success",
    toastErrorTitle: lang === "km" ? "បរាជ័យ" : "Error",
    statusUpdateSuccess: lang === "km" ? "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពសេវាកម្ម។" : "Service status updated.",
    statusUpdateFailed: lang === "km" ? "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពសេវាកម្មបានទេ។" : "Unable to update service status.",
  };
}
