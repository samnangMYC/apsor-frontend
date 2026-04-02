import { FolderKanban, FolderTree, Logs, Users } from "lucide-react";

export function getAdminDashboardText(lang) {
  return {
    overviewTitle: lang === "km" ? "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ" : "System overview",
    overviewDescription: lang === "km"
      ? "មើលទិន្នន័យសង្ខេប និងចូលដំណើរការផ្នែកគ្រប់គ្រងសំខាន់ៗបានលឿន។"
      : "Review live summary metrics and jump into the main management areas quickly.",
    liveData: lang === "km" ? "ទិន្នន័យបច្ចុប្បន្ន" : "Live data",
    refresh: lang === "km" ? "ផ្ទុកឡើងវិញ" : "Refresh",
    quickActions: lang === "km" ? "សកម្មភាពរហ័ស" : "Quick actions",
    analyticsTitle: lang === "km" ? "ការវិភាគទិន្នន័យ" : "Analytics",
    analyticsDescription: lang === "km"
      ? "មើលទិសដៅសំខាន់ៗតាមរយៈគំនូសតាងសង្ខេបពីទិន្នន័យផ្ទាំងគ្រប់គ្រង។"
      : "See key patterns at a glance with compact charts built from dashboard data.",
    entityComparison: lang === "km" ? "ប្រៀបធៀបទិន្នន័យសំខាន់ៗ" : "Entity comparison",
    entityComparisonDescription: lang === "km"
      ? "ប្រៀបធៀបចំនួនអ្នកប្រើ ប្រភេទ ប្រភេទរង និងកំណត់ហេតុសកម្មភាព។"
      : "Compare totals for users, categories, subcategories, and audit logs.",
    recentActivity: lang === "km" ? "សកម្មភាព 7 ថ្ងៃចុងក្រោយ" : "Recent 7-day activity",
    recentActivityDescription: lang === "km"
      ? "តាមដានអ្នកប្រើថ្មី និងកំណត់ហេតុសកម្មភាពចុងក្រោយតាមថ្ងៃ។"
      : "Track recent user signups and audit activity by day.",
    actionBreakdown: lang === "km" ? "ប្រភេទសកម្មភាព audit" : "Audit action breakdown",
    actionBreakdownDescription: lang === "km"
      ? "មើលសកម្មភាពដែលកើតឡើងញឹកញាប់បំផុតនៅក្នុងកំណត់ហេតុ។"
      : "See which audit actions appear most often in the latest activity.",
    newUsers: lang === "km" ? "អ្នកប្រើថ្មី" : "New users",
    auditEvents: lang === "km" ? "ព្រឹត្តិការណ៍ audit" : "Audit events",
    noChartData: lang === "km" ? "មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់បង្ហាញគំនូសតាង។" : "Not enough data to display this chart yet.",
    latestUsers: lang === "km" ? "អ្នកប្រើថ្មីៗ" : "Recent users",
    latestAuditLogs: lang === "km" ? "កំណត់ហេតុថ្មីៗ" : "Recent audit logs",
    emptyUsers: lang === "km" ? "មិនទាន់មានទិន្នន័យអ្នកប្រើនៅឡើយ។" : "No recent users yet.",
    emptyAuditLogs: lang === "km" ? "មិនទាន់មានកំណត់ហេតុសកម្មភាពនៅឡើយ។" : "No recent audit logs yet.",
    open: lang === "km" ? "បើក" : "Open",
    viewAllUsers: lang === "km" ? "មើលអ្នកប្រើទាំងអស់" : "View all users",
    viewCategories: lang === "km" ? "មើលប្រភេទ" : "View categories",
    viewSubcategories: lang === "km" ? "មើលប្រភេទរង" : "View subcategories",
    viewAuditLogs: lang === "km" ? "មើលកំណត់ហេតុសកម្មភាព" : "View audit logs",
    totalUsers: lang === "km" ? "អ្នកប្រើសរុប" : "Total users",
    totalCategories: lang === "km" ? "ប្រភេទ" : "Categories",
    totalSubcategories: lang === "km" ? "ប្រភេទរង" : "Subcategories",
    totalAuditLogs: lang === "km" ? "កំណត់ហេតុសកម្មភាព" : "Audit logs",
    createdAt: lang === "km" ? "បង្កើតនៅ" : "Created at",
    occurredAt: lang === "km" ? "កើតឡើងនៅ" : "Occurred at",
    action: lang === "km" ? "សកម្មភាព" : "Action",
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
        key: "totalCategories",
        label: lang === "km" ? "ប្រភេទ" : "Categories",
        accent: "from-amber-500/20 via-bg-surface to-amber-500/5",
        iconWrap: "bg-amber-500 text-white",
        icon: FolderKanban,
      },
      {
        key: "totalSubcategories",
        label: lang === "km" ? "ប្រភេទរង" : "Subcategories",
        accent: "from-fuchsia-500/20 via-bg-surface to-fuchsia-500/5",
        iconWrap: "bg-fuchsia-500 text-white",
        icon: FolderTree,
      },
      {
        key: "totalAuditLogs",
        label: lang === "km" ? "កំណត់ហេតុសកម្មភាព" : "Audit logs",
        accent: "from-indigo-500/20 via-bg-surface to-indigo-500/5",
        iconWrap: "bg-indigo-500 text-white",
        icon: Logs,
      },
    ],
  };
}
