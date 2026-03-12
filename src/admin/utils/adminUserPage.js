export const ADMIN_USER_ALL_STATUS = "ALL";
export const ADMIN_USER_DEFAULT_SORTING = [{ id: "id", desc: true }];

export function mapAdminUserSortingToApiQuery(sorting) {
  const primarySort = sorting[0];
  const sortMap = {
    id: "id",
    username: "username",
    email: "email",
    userType: "userType",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    lastLoginAt: "lastLoginAt",
    lastSeenAt: "lastSeenAt",
  };

  return {
    sortBy: sortMap[primarySort?.id] ?? "id",
    sortOrder: primarySort?.desc === false ? "asc" : "desc",
  };
}

export function getAdminUserText(lang, t) {
  return {
    id: "ID",
    username: lang === "km" ? "ឈ្មោះគណនី" : "Username",
    fullName: lang === "km" ? "ឈ្មោះពេញ" : "Full Name",
    firstName: lang === "km" ? "នាមខ្លួន" : "First Name",
    lastName: lang === "km" ? "នាមត្រកូល" : "Last Name",
    email: "Email",
    phoneNumber: lang === "km" ? "លេខទូរស័ព្ទ" : "Phone Number",
    userType: lang === "km" ? "ប្រភេទអ្នកប្រើ" : "User Type",
    status: lang === "km" ? "ស្ថានភាព" : "Status",
    temporaryPassword: lang === "km" ? "ពាក្យសម្ងាត់បណ្តោះអាសន្ន" : "Temporary Password",
    password: lang === "km" ? "ពាក្យសម្ងាត់" : "Password",
    newPassword: lang === "km" ? "ពាក្យសម្ងាត់ថ្មី" : "New Password",
    newPasswordHint: lang === "km"
      ? "យ៉ាងហោចណាស់ 8 តួអក្សរ មានអក្សរតូច អក្សរធំ លេខ អក្សរពិសេស និងគ្មានដកឃ្លា។"
      : "At least 8 characters with uppercase, lowercase, number, special character, and no spaces.",
    passwordValidationMessage: lang === "km"
      ? "ពាក្យសម្ងាត់ត្រូវមាន 8-128 តួអក្សរ មានអក្សរតូច អក្សរធំ លេខ អក្សរពិសេស និងគ្មានដកឃ្លា។"
      : "Password must be 8-128 characters and include uppercase, lowercase, number, special character, and no spaces.",
    lastLoginAt: lang === "km" ? "ចូលចុងក្រោយ" : "Last Login",
    lastSeenAt: lang === "km" ? "ឃើញចុងក្រោយ" : "Last Seen",
    createdAt: lang === "km" ? "បង្កើតនៅ" : "Created At",
    users: lang === "km" ? "ការគ្រប់គ្រងអ្នកប្រើ" : "User Management",
    addUser: lang === "km" ? "បន្ថែមអ្នកប្រើថ្មី" : "Add new user",
    editUser: lang === "km" ? "កែប្រែអ្នកប្រើ" : "Edit user",
    create: lang === "km" ? "បង្កើត" : "Create",
    update: lang === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Update",
    edit: t.edit || "Edit",
    softDelete: lang === "km" ? "លុបទន់" : "Soft Delete",
    hardDelete: lang === "km" ? "លុបអចិន្រ្តៃយ៍" : "Hard Delete",
    close: lang === "km" ? "បិទ" : "Close",
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    searchPlaceholder: lang === "km" ? "ស្វែងរកអ្នកប្រើ" : "Search users",
    emptyMessage: lang === "km" ? "មិនមានអ្នកប្រើត្រូវនឹងការស្វែងរកនេះទេ។" : "No users match this search.",
    filterAllStatuses: lang === "km" ? "ស្ថានភាពទាំងអស់" : "All statuses",
    filterDeleted: lang === "km" ? "បានលុប" : "Deleted",
    userTypeCustomer: lang === "km" ? "អតិថិជន" : "Customer",
    userTypeProvider: lang === "km" ? "អ្នកផ្តល់សេវា" : "Provider",
    userTypeAdmin: lang === "km" ? "អ្នកគ្រប់គ្រង" : "Admin",
    requestFailed: lang === "km" ? "សំណើបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។" : "Request failed. Please try again.",
    validationRequired: lang === "km" ? "សូមបំពេញវាលនេះ។" : "This field is required.",
    deleteTitle: lang === "km" ? "បញ្ជាក់ការលុប" : "Confirm soft delete",
    deleteConfirm: lang === "km" ? "តើអ្នកពិតជាចង់លុបអ្នកប្រើនេះមែនទេ?" : "Are you sure you want to soft delete this user?",
    hardDeleteTitle: lang === "km" ? "បញ្ជាក់ការលុបអចិន្រ្តៃយ៍" : "Confirm hard delete",
    hardDeleteConfirm: lang === "km" ? "តើអ្នកពិតជាចង់លុបអ្នកប្រើនេះជាអចិន្រ្តៃយ៍មែនទេ?" : "Are you sure you want to permanently delete this user?",
    statusActive: t.active || "Active",
    statusSuspended: lang === "km" ? "ផ្អាក" : "Suspended",
    statusDeleted: lang === "km" ? "បានលុប" : "Deleted",
    toastSuccessTitle: lang === "km" ? "ជោគជ័យ" : "Success",
    toastErrorTitle: lang === "km" ? "បរាជ័យ" : "Error",
    toastCreateSuccess: lang === "km" ? "បានបង្កើតអ្នកប្រើថ្មីដោយជោគជ័យ។" : "User created successfully.",
    toastUpdateSuccess: lang === "km" ? "បានកែប្រែអ្នកប្រើដោយជោគជ័យ។" : "User updated successfully.",
    toastPasswordSuccess: lang === "km" ? "បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ។" : "Password updated successfully.",
    toastSoftDeleteSuccess: lang === "km" ? "បានលុបអ្នកប្រើដោយជោគជ័យ។" : "User soft deleted successfully.",
    toastHardDeleteSuccess: lang === "km" ? "បានលុបអ្នកប្រើជាអចិន្រ្តៃយ៍ដោយជោគជ័យ។" : "User permanently deleted successfully.",
  };
}
