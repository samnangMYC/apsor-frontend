import { FolderKanban, FolderTree, ShieldCheck, Users } from "lucide-react";

export function getAdminDashboardText(lang) {
  return {
    overviewTitle: lang === "km" ? "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ" : "System overview",
    overviewDescription: lang === "km"
      ? "មើលទិន្នន័យសង្ខេប និងចូលដំណើរការផ្នែកគ្រប់គ្រងសំខាន់ៗបានលឿន។"
      : "Review live summary metrics and jump into the main management areas quickly.",
    liveData: lang === "km" ? "ទិន្នន័យបច្ចុប្បន្ន" : "Live data",
    refresh: lang === "km" ? "ផ្ទុកឡើងវិញ" : "Refresh",
    quickActions: lang === "km" ? "សកម្មភាពរហ័ស" : "Quick actions",
    latestUsers: lang === "km" ? "អ្នកប្រើថ្មីៗ" : "Recent users",
    emptyUsers: lang === "km" ? "មិនទាន់មានទិន្នន័យអ្នកប្រើនៅឡើយ។" : "No recent users yet.",
    open: lang === "km" ? "បើក" : "Open",
    viewAllUsers: lang === "km" ? "មើលអ្នកប្រើទាំងអស់" : "View all users",
    viewCategories: lang === "km" ? "មើលប្រភេទ" : "View categories",
    viewSubcategories: lang === "km" ? "មើលប្រភេទរង" : "View subcategories",
    activeUsers: lang === "km" ? "អ្នកប្រើសកម្ម" : "Active users",
    totalUsers: lang === "km" ? "អ្នកប្រើសរុប" : "Total users",
    categories: lang === "km" ? "ប្រភេទ" : "Categories",
    subcategories: lang === "km" ? "ប្រភេទរង" : "Subcategories",
    lastLogin: lang === "km" ? "ចូលចុងក្រោយ" : "Last login",
    never: lang === "km" ? "មិនទាន់ចូល" : "Never logged in",
    customer: lang === "km" ? "អតិថិជន" : "Customer",
    provider: lang === "km" ? "អ្នកផ្តល់សេវា" : "Provider",
    admin: lang === "km" ? "អ្នកគ្រប់គ្រង" : "Admin",
    requestFailed: lang === "km" ? "មិនអាចផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រងបានទេ។" : "Failed to load dashboard data.",
    stats: [
      {
        key: "totalUsers",
        label: lang === "km" ? "អ្នកប្រើសរុប" : "Total users",
        accent: "from-sky-500/20 via-bg-surface to-sky-500/5",
        iconWrap: "bg-sky-500 text-white",
        icon: Users,
      },
      {
        key: "activeUsers",
        label: lang === "km" ? "អ្នកប្រើសកម្ម" : "Active users",
        accent: "from-emerald-500/20 via-bg-surface to-emerald-500/5",
        iconWrap: "bg-emerald-500 text-white",
        icon: ShieldCheck,
      },
      {
        key: "categories",
        label: lang === "km" ? "ប្រភេទ" : "Categories",
        accent: "from-amber-500/20 via-bg-surface to-amber-500/5",
        iconWrap: "bg-amber-500 text-white",
        icon: FolderKanban,
      },
      {
        key: "subcategories",
        label: lang === "km" ? "ប្រភេទរង" : "Subcategories",
        accent: "from-fuchsia-500/20 via-bg-surface to-fuchsia-500/5",
        iconWrap: "bg-fuchsia-500 text-white",
        icon: FolderTree,
      },
    ],
  };
}

export function getUserTypeLabel(userType, text) {
  if (userType === "PROVIDER") return text.provider;
  if (userType === "ADMIN") return text.admin;
  return text.customer;
}
