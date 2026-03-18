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
    statusActive: lang === "km" ? "សកម្ម" : "Active",
    statusInactive: lang === "km" ? "មិនសកម្ម" : "Inactive",
    statusSuspended: lang === "km" ? "ផ្អាក" : "Suspended",
  };
}
