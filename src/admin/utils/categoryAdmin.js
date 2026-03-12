export function formatAdminDate(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function createCategoryDraft(category) {
  return {
    ...category,
    name: { ...category.name },
    description: { ...category.description },
    imageUrl: category.imageUrl || "",
    imageFile: null,
    removeImage: false,
  };
}

export function createEmptyCategoryDraft() {
  return {
    id: null,
    name: {
      en: "",
      km: "",
    },
    description: {
      en: "",
      km: "",
    },
    sortOrder: 0,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
    imageUrl: "",
    imageFile: null,
    removeImage: false,
  };
}

export function applyCategoryDraft(category, draft) {
  return {
    ...category,
    ...draft,
    imageUrl: draft.imageUrl || null,
    updatedAt: new Date().toISOString(),
  };
}

export function createCategoryFromDraft(draft, nextId) {
  const timestamp = new Date().toISOString();

  return {
    ...draft,
    id: nextId,
    imageUrl: draft.imageUrl || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getAdminCategoryText(lang, t) {
  return {
    id: "ID",
    image: lang === "km" ? "រូបភាព" : "Image",
    name: lang === "km" ? "ឈ្មោះ" : "Name",
    slug: t.slug || "Slug",
    description: lang === "km" ? "ការពិពណ៌នា" : "Description",
    sort: lang === "km" ? "លំដាប់" : "Sort",
    status: lang === "km" ? "ស្ថានភាព" : "Status",
    created: lang === "km" ? "បង្កើតនៅ" : "Created",
    updated: lang === "km" ? "កែប្រែចុងក្រោយ" : "Updated",
    categories: t.categories || "Categories",
    subtitle: lang === "km"
      ? "អ្នកអាចស្វែងរក តម្រៀប និងត្រងទិន្នន័យ ដើម្បីរកអ្វីដែលអ្នកត្រូវការ។"
      : "You can search, sort, and filter the data to find what you need.",
    searchPlaceholder: lang === "km" ? "ស្វែងរកប្រភេទ" : "Search categories",
    filterAllStatuses: lang === "km" ? "ស្ថានភាពទាំងអស់" : "All statuses",
    emptyMessage: lang === "km" ? "មិនមានប្រភេទត្រូវនឹងការស្វែងរកនេះទេ។" : "No categories match this search.",
    actions: lang === "km" ? "សកម្មភាព" : "Actions",
    edit: t.edit || "Edit",
    add: lang === "km" ? "បន្ថែម" : "Add",
    addCategory: lang === "km" ? "បន្ថែមប្រភេទថ្មី" : "Add new category",
    create: lang === "km" ? "បង្កើត" : "Create",
    update: lang === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Update",
    delete: t.delete || "Delete",
    imageAction: lang === "km" ? "រូបភាព" : "Image",
    editCategory: lang === "km" ? "កែប្រែប្រភេទ" : "Edit category",
    uploadImage: lang === "km" ? "បង្ហោះរូបភាព" : "Upload image",
    removeImage: lang === "km" ? "លុបរូបភាព" : "Remove image",
    noImageSelected: lang === "km" ? "មិនទាន់មានរូបភាព" : "No image selected",
    imageUploadTitle: lang === "km" ? "ជ្រើសរើសរូបភាព" : "Choose an image",
    imageUploadHint: lang === "km"
      ? "សូមជ្រើសរើសឯកសាររូបភាពពីឧបករណ៍របស់អ្នក។"
      : "Select an image file from your device.",
    imageUploadFormats: lang === "km"
      ? "គាំទ្រ JPG, PNG, WebP ទំហំអតិបរមា 8MB។"
      : "Supports JPG, PNG, and WebP up to 8MB.",
    nameEn: t.nameEn || "Name (EN)",
    nameKm: t.nameKm || "Name (KM)",
    descriptionEn: lang === "km" ? "ការពិពណ៌នា (EN)" : "Description (EN)",
    descriptionKm: lang === "km" ? "ការពិពណ៌នា (KM)" : "Description (KM)",
    imageUrl: lang === "km" ? "តំណរូបភាព" : "Image URL",
    validationRequired: lang === "km" ? "សូមបំពេញវាលនេះ។" : "This field is required.",
    validationImageUrl: lang === "km" ? "សូមបញ្ចូលតំណរូបភាពដែលត្រឹមត្រូវ។" : "Enter a valid image URL.",
    validationImageRequired: lang === "km" ? "សូមជ្រើសរើសរូបភាពមួយ។" : "Please choose an image.",
    validationImageFileType: lang === "km" ? "សូមប្រើតែឯកសារ JPG, PNG ឬ WebP ប៉ុណ្ណោះ។" : "Use a JPG, PNG, or WebP image.",
    validationImageFileSize: lang === "km" ? "ទំហំរូបភាពត្រូវតែតិចជាង 8MB។" : "Image size must be under 8MB.",
    validationImageFileRead: lang === "km" ? "មិនអាចអានឯកសាររូបភាពនេះបានទេ។" : "Could not read this image file.",
    validationSortRequired: lang === "km" ? "សូមបញ្ចូលលំដាប់។" : "Sort is required.",
    validationSort: lang === "km" ? "លំដាប់ត្រូវតែជាចំនួនគត់ស្មើ ឬ ធំជាង 0។" : "Sort must be a whole number greater than or equal to 0.",
    requestFailed: lang === "km" ? "សំណើបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។" : "Request failed. Please try again.",
    toastSuccessTitle: lang === "km" ? "ជោគជ័យ" : "Success",
    toastErrorTitle: lang === "km" ? "បរាជ័យ" : "Error",
    toastCreateSuccess: lang === "km" ? "បានបង្កើតប្រភេទថ្មីដោយជោគជ័យ។" : "Category created successfully.",
    toastUpdateSuccess: lang === "km" ? "បានកែប្រែប្រភេទដោយជោគជ័យ។" : "Category updated successfully.",
    toastImageSuccess: lang === "km" ? "បានធ្វើបច្ចុប្បន្នភាពរូបភាពដោយជោគជ័យ។" : "Category image updated successfully.",
    toastDeleteSuccess: lang === "km" ? "បានលុបប្រភេទដោយជោគជ័យ។" : "Category deleted successfully.",
    statusActive: t.active || "Active",
    statusInactive: lang === "km" ? "អសកម្ម" : "Inactive",
    close: lang === "km" ? "បិទ" : "Close",
    cancel: t.cancel || "Cancel",
    deleteConfirm: lang === "km" ? "តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?" : "Are you sure you want to delete this category?",
    deleteTitle: lang === "km" ? "បញ្ជាក់ការលុប" : "Confirm deletion",
  };
}
