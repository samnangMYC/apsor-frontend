import axios from "./api";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";
import { appendAssetVersion, resolveAssetUrl } from "../utils/assets";
import { getServiceImage } from "../utils/service";

function extractCollectionPayload(responseData) {
    return responseData?.data ?? responseData;
}

function extractCollectionItems(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.content)) {
        return payload.content;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    return [];
}

function extractSingleItem(payload) {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const items = extractCollectionItems(payload);
    if (items.length > 0) {
        return items[0];
    }

    return payload;
}

function mapAdminCategory(category) {
    const resolvedImageUrl = resolveAssetUrl(category?.imageUrl);
    const imageVersion = category?.updatedAt || category?.createdAt || Date.now();

    return {
        id: category?.id,
        name: category?.name ?? { en: "", km: "" },
        slug: category?.slug ?? "",
        description: category?.description ?? { en: "", km: "" },
        sortOrder: category?.sortOrder ?? 0,
        status: category?.status ?? "ACTIVE",
        createdAt: category?.createdAt ?? "",
        updatedAt: category?.updatedAt ?? "",
        imageUrl: appendAssetVersion(resolvedImageUrl, imageVersion),
    };
}

// Authentication API
export const signIn = async (payload) => {
    const { data } = await axios.post("/api/v1/auth/signin", payload);
    return data;
};

export const signUp = async (payload) => {
    const { data } = await axios.post("/api/v1/auth/signup", payload);
    return data;
};

export const createCustomer = async (payload, accessToken = "") => {
    const { data } = await axios.post("/api/v1/admin/customers", payload, {
        headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
            }
            : undefined,
    });
    return data;
};

export const updateCustomer = async (customerId, payload, accessToken = "") => {
    const { data } = await axios.patch(`/api/v1/admin/customers/${customerId}`, {
        dob: payload?.dob ?? "",
        gender: payload?.gender ?? "",
        preferredLanguage: payload?.preferredLanguage ?? "",
        bio: payload?.bio ?? "",
        onboardingCompleted: Boolean(payload?.onboardingCompleted),
    }, {
        headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
            }
            : undefined,
    });
    return data;
};

export const hardDeleteCustomer = async (customerId, accessToken = "") => {
    const { data } = await axios.delete(`/api/v1/admin/customers/${customerId}/hard`, {
        headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
            }
            : undefined,
    });
    return data;
};

export const signOut = async () => {
    const { data } = await axios.post("/api/v1/auth/signout");
    return data;
};

// For Admin Dashboard Page API
export const fetchCurrentUser = async () => {
    const { data } = await axios.get("/api/v1/users/me");
    return data;
};

export const createAdminCategory = async (payload) => {
    const { data } = await axios.post("/api/v1/categories", {
        name: payload?.name ?? { en: "", km: "" },
        description: payload?.description ?? { en: "", km: "" },
        sortOrder: payload?.sortOrder ?? 0,
    });

    return mapAdminCategory(extractCollectionPayload(data));
};

export const updateAdminCategory = async (categoryId, payload) => {
    const { data } = await axios.patch(`/api/v1/categories/${categoryId}`, {
        name: payload?.name ?? { en: "", km: "" },
        slug: payload?.slug ?? "",
        description: payload?.description ?? { en: "", km: "" },
        sortOrder: payload?.sortOrder ?? 0,
    });

    return mapAdminCategory(extractCollectionPayload(data));
};

export const updateAdminCategoryStatus = async (categoryId, status) => {
    const { data } = await axios.patch(`/api/v1/categories/${categoryId}/status`, {
        status,
    });

    return extractCollectionPayload(data);
};

export const deleteAdminCategory = async (categoryId) => {
    const { data } = await axios.delete(`/api/v1/categories/${categoryId}/hard`);
    return extractCollectionPayload(data);
};

export const uploadAdminCategoryImage = async (categoryId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(`/api/v1/categories/${categoryId}/image`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return extractCollectionPayload(data);
};

export const fetchAdminCategoryImages = async (categoryId) => {
    const { data } = await axios.get(`/api/v1/categories/${categoryId}/image`);
    const payload = extractCollectionPayload(data);
    return Array.isArray(payload) ? payload : [];
};

export const deleteAdminCategoryImage = async (categoryId, mediaId) => {
    const { data } = await axios.delete(`/api/v1/categories/${categoryId}/image/${mediaId}`);
    return extractCollectionPayload(data);
};

export const fetchAdminCategories = async ({
    keyword = "",
    status,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/categories", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
            ...(status ? { status } : {}),
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    const totalItems =
        payload?.totalElements
        ?? payload?.totalItems
        ?? payload?.count
        ?? items.length;
    const currentPage = payload?.number ?? payload?.pageNumber ?? pageNumber;
    const currentPageSize = payload?.size ?? payload?.pageSize ?? pageSize;

    return {
        items: items.map(mapAdminCategory),
        totalItems,
        pageNumber: currentPage,
        pageSize: currentPageSize,
    };
};

export const fetchAdminSubcategories = async ({
    keyword = "",
    status,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/sub-categories", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
            ...(status ? { status } : {}),
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    const totalItems =
        payload?.totalElements
        ?? payload?.totalItems
        ?? payload?.count
        ?? items.length;
    const currentPage = payload?.number ?? payload?.pageNumber ?? pageNumber;
    const currentPageSize = payload?.size ?? payload?.pageSize ?? pageSize;

    return {
        items,
        totalItems,
        pageNumber: currentPage,
        pageSize: currentPageSize,
    };
};

export const updateAdminSubcategory = async (subcategoryId, payload) => {
    const { data } = await axios.patch(`/api/v1/sub-categories/${subcategoryId}`, {
        name: payload?.name ?? "",
        description: payload?.description ?? "",
        sortOrder: payload?.sortOrder ?? 0,
    });

    return extractCollectionPayload(data);
};

export const deleteAdminSubcategory = async (subcategoryId) => {
    const { data } = await axios.delete(`/api/v1/sub-categories/${subcategoryId}/hard`);
    return extractCollectionPayload(data);
};

export const fetchAdminUsers = async ({
    keyword = "",
    status,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/admin/users", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
            ...(status ? { status } : {}),
        },
    });

    const payload = extractCollectionPayload(data);
    const normalizedPayload = Array.isArray(payload) && payload.length === 1 && payload[0]?.content
        ? payload[0]
        : payload;
    const items = extractCollectionItems(normalizedPayload);

    const totalItems =
        normalizedPayload?.totalElements
        ?? normalizedPayload?.totalItems
        ?? normalizedPayload?.count
        ?? items.length;
    const currentPage = normalizedPayload?.number ?? normalizedPayload?.pageNumber ?? pageNumber;
    const currentPageSize = normalizedPayload?.size ?? normalizedPayload?.pageSize ?? pageSize;

    return {
        items,
        totalItems,
        pageNumber: currentPage,
        pageSize: currentPageSize,
    };
};

export const createAdminUser = async (payload) => {
    const { data } = await axios.post("/api/v1/admin/users", {
        username: payload?.username ?? "",
        email: payload?.email ?? "",
        firstName: payload?.firstName ?? "",
        lastName: payload?.lastName ?? "",
        userType: payload?.userType ?? "CUSTOMER",
        status: payload?.status ?? "ACTIVE",
        phoneNumber: payload?.phoneNumber ?? "",
        temporaryPassword: payload?.temporaryPassword ?? "",
    });

    return extractCollectionPayload(data);
};

export const updateAdminUser = async (userId, payload) => {
    const { data } = await axios.patch(`/api/v1/admin/users/${userId}`, {
        username: payload?.username ?? "",
        email: payload?.email ?? "",
        firstName: payload?.firstName ?? "",
        lastName: payload?.lastName ?? "",
        status: payload?.status ?? "ACTIVE",
        phoneNumber: payload?.phoneNumber ?? "",
    });

    return extractCollectionPayload(data);
};

export const updateAdminUserType = async (userId, userType) => {
    const { data } = await axios.patch(`/api/v1/admin/users/${userId}/user-type`, {
        userType: userType ?? "CUSTOMER",
    });

    return extractCollectionPayload(data);
};

export const updateAdminUserPassword = async (userId, newPassword) => {
    const { data } = await axios.patch(`/api/v1/admin/users/${userId}/password`, {
        newPassword: newPassword ?? "",
    });

    return extractCollectionPayload(data);
};

export const deleteAdminUser = async (userId) => {
    const { data } = await axios.delete(`/api/v1/admin/users/${userId}`);
    return extractCollectionPayload(data);
};

export const hardDeleteAdminUser = async (userId) => {
    const { data } = await axios.delete(`/api/v1/admin/users/${userId}/hard`);
    return extractCollectionPayload(data);
};

function normalizeAdminListParams(
    pageNumberOrParams = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc"
) {
    if (typeof pageNumberOrParams === "object" && pageNumberOrParams !== null) {
        return {
            pageNumber: pageNumberOrParams.pageNumber ?? 0,
            pageSize: pageNumberOrParams.pageSize ?? 10,
            sortBy: pageNumberOrParams.sortBy ?? "id",
            sortOrder: pageNumberOrParams.sortOrder ?? "desc",
        };
    }

    return {
        pageNumber: pageNumberOrParams,
        pageSize,
        sortBy,
        sortOrder,
    };
}

const isCustomerRecord = (item) => item?.user?.userType === "CUSTOMER";

export const fetchAdminCustomers = async (
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc"
) => {
    const params = normalizeAdminListParams(pageNumber, pageSize, sortBy, sortOrder);
    const { data } = await axios.get("/api/v1/admin/customers", {
        params,
    });

    const items = (data.content ?? []).filter(isCustomerRecord);

    return {
        items,
        pageNumber: data.pageNumber ?? 0,
        pageSize: data.pageSize ?? params.pageSize,
        totalElements: data.totalElements ?? items.length,
        totalPages: data.totalPages ?? 0,
        lastPage: data.lastPage ?? true,
    };
};

export const fetchAdminProviders = async (
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc"
) => {
    const params = normalizeAdminListParams(pageNumber, pageSize, sortBy, sortOrder);
    const { data } = await axios.get("/api/v1/admin/providers", {
        params,
    });
    const items = data.content ?? [];

    return {
        items,
        pageNumber: data.pageNumber ?? 0,
        pageSize: data.pageSize ?? params.pageSize,
        totalElements: data.totalElements ?? items.length,
        totalPages: data.totalPages ?? 0,
        lastPage: data.lastPage ?? true,
    };
};

export const createAdminProvider = async (payload) => {
    const { data } = await axios.post("/api/v1/admin/providers", {
        userId: payload?.userId ?? null,
        displayName: payload?.displayName ?? "",
        bio: payload?.bio ?? "",
        businessName: payload?.businessName ?? "",
        businessType: payload?.businessType ?? "",
        establishedAt: payload?.establishedAt ?? "",
        websiteUrl: payload?.websiteUrl ?? "",
        facebookUrl: payload?.facebookUrl ?? "",
        telegram: payload?.telegram ?? "",
    });

    return extractCollectionPayload(data);
};

export const updateAdminProvider = async (providerId, payload) => {
    const { data } = await axios.patch(`/api/v1/admin/providers/${providerId}`, {
        username: payload?.username ?? "",
        email: payload?.email ?? "",
        firstName: payload?.firstName ?? "",
        lastName: payload?.lastName ?? "",
        userType: payload?.userType ?? "PROVIDER",
        phoneNumber: payload?.phoneNumber ?? "",
        password: payload?.password ?? "",
    });

    return extractCollectionPayload(data);
};

export const deleteAdminProvider = async (providerId) => {
    const { data } = await axios.delete(`/api/v1/admin/providers/${providerId}`);
    return extractCollectionPayload(data);
};

export const updateAdminProviderStatus = async (providerId, status) => {
    const { data } = await axios.patch(`/api/v1/admin/providers/${providerId}/status`, {
        status: status ?? "DRAFT",
    });

    return extractCollectionPayload(data);
};

export const fetchAdminProviderAvatar = async (providerId) => {
    const { data } = await axios.get(`/api/v1/admin/providers/${providerId}/avatar`);
    const payload = extractCollectionPayload(data);
    const objectKey = payload?.media?.objectKey;
    const updatedAt = payload?.media?.updatedAt || payload?.media?.createdAt;
    const resolvedUrl = appendAssetVersion(resolveAssetUrl(objectKey), updatedAt);

    if (!resolvedUrl) {
        return null;
    }

    return {
        ...payload,
        imageUrl: resolvedUrl,
    };
};

export const fetchServices = async ({
    keyword = "",
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/services", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    return {
        items,
        pageNumber: payload?.pageNumber ?? payload?.number ?? pageNumber,
        pageSize: payload?.pageSize ?? payload?.size ?? pageSize,
        totalElements: payload?.totalElements ?? payload?.totalItems ?? items.length,
        totalPages: payload?.totalPages ?? 0,
        lastPage: payload?.lastPage ?? true,
    };
};

export const fetchPublicServices = async ({
    keyword = "",
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/public/services", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    return {
        items,
        pageNumber: payload?.pageNumber ?? payload?.number ?? pageNumber,
        pageSize: payload?.pageSize ?? payload?.size ?? pageSize,
        totalElements: payload?.totalElements ?? payload?.totalItems ?? items.length,
        totalPages: payload?.totalPages ?? 0,
        lastPage: payload?.lastPage ?? true,
    };
};

export const createService = async (payload) => {
    const normalizedLocationMode = String(payload?.locationMode || "").trim().toUpperCase();
    const safeLocationMode = ["ONSITE", "REMOTE", "BOTH"].includes(normalizedLocationMode)
        ? normalizedLocationMode
        : "ONSITE";

    const { data } = await axios.post("/api/v1/services", {
        title: payload?.title ?? "",
        description: payload?.description ?? "",
        subCategoryId: payload?.subCategoryId ?? null,
        subcategoryId: payload?.subCategoryId ?? null,
        locationMode: safeLocationMode,
        serviceLocationMode: safeLocationMode,
        location_mode: safeLocationMode,
    });

    return extractCollectionPayload(data);
};

export const updateService = async (serviceId, payload) => {
    const normalizedLocationMode = String(payload?.locationMode || "").trim().toUpperCase();
    const safeLocationMode = ["ONSITE", "REMOTE", "BOTH"].includes(normalizedLocationMode)
        ? normalizedLocationMode
        : "ONSITE";

    const normalizedStatus = String(payload?.status || "").trim().toUpperCase();
    const safeStatus = ["ACTIVE", "INACTIVE", "SUSPENDED", "DRAFT"].includes(normalizedStatus)
        ? normalizedStatus
        : "ACTIVE";

    const { data } = await axios.patch(`/api/v1/services/${serviceId}`, {
        title: payload?.title ?? "",
        description: payload?.description ?? "",
        locationMode: safeLocationMode,
        status: safeStatus,
    });

    return extractCollectionPayload(data);
};

export const deleteService = async (serviceId) => {
    const { data } = await axios.delete(`/api/v1/services/${serviceId}`);
    return extractCollectionPayload(data);
};

export const createServiceAvailability = async (payload) => {
    const { data } = await axios.post("/api/v1/service/availabilities", {
        serviceId: payload?.serviceId ?? null,
        openDaysMask: payload?.openDaysMask ?? 0,
        startTime: payload?.startTime ?? "",
        endTime: payload?.endTime ?? "",
        slotDurationMinutes: payload?.slotDurationMinutes ?? 0,
        capacityPerSlot: payload?.capacityPerSlot ?? 0,
    });

    return extractCollectionPayload(data);
};

export const updateServiceAvailability = async (availabilityId, payload) => {
    const { data } = await axios.patch(`/api/v1/service/availabilities/${availabilityId}`, {
        serviceId: payload?.serviceId ?? null,
        openDaysMask: payload?.openDaysMask ?? 0,
        startTime: payload?.startTime ?? "",
        endTime: payload?.endTime ?? "",
        slotDurationMinutes: payload?.slotDurationMinutes ?? 0,
        capacityPerSlot: payload?.capacityPerSlot ?? 0,
    });

    return extractCollectionPayload(data);
};

export const createServiceLocation = async (payload) => {
    const { data } = await axios.post("/api/v1/service/locations", {
        serviceId: payload?.serviceId ?? null,
        line1: payload?.line1 ?? "",
        line2: payload?.line2 ?? "",
        district: payload?.district ?? "",
        city: payload?.city ?? "",
        province: payload?.province ?? "",
        postalCode: payload?.postalCode ?? "",
        countryCode: payload?.countryCode ?? "",
        latitude: payload?.latitude ?? null,
        longitude: payload?.longitude ?? null,
        isDefault: Boolean(payload?.isDefault),
    });

    return extractCollectionPayload(data);
};

export const updateServiceLocation = async (locationId, payload) => {
    const { data } = await axios.patch(`/api/v1/service/locations/${locationId}`, {
        serviceId: payload?.serviceId ?? null,
        line1: payload?.line1 ?? "",
        line2: payload?.line2 ?? "",
        district: payload?.district ?? "",
        city: payload?.city ?? "",
        province: payload?.province ?? "",
        postalCode: payload?.postalCode ?? "",
        countryCode: payload?.countryCode ?? "",
        latitude: payload?.latitude ?? null,
        longitude: payload?.longitude ?? null,
        isDefault: Boolean(payload?.isDefault),
    });

    return extractCollectionPayload(data);
};

export const createServicePrice = async (payload) => {
    const { data } = await axios.post("/api/v1/services/prices", {
        serviceId: payload?.serviceId ?? null,
        name: payload?.name ?? "",
        priceType: payload?.priceType ?? "TIME_BASED",
        billingUnit: payload?.billingUnit ?? "DAY",
        amount: payload?.amount ?? 0,
        currency: payload?.currency ?? "USD",
        isDefault: Boolean(payload?.isDefault),
        minUnits: payload?.minUnits ?? 1,
        maxUnits: payload?.maxUnits ?? 1,
    });

    return extractCollectionPayload(data);
};

export const updateServicePrice = async (priceId, payload) => {
    const normalizedStatus = String(payload?.status || "").trim().toUpperCase();
    const safeStatus = ["ACTIVE", "INACTIVE", "SUSPENDED", "DRAFT"].includes(normalizedStatus)
        ? normalizedStatus
        : "ACTIVE";

    const { data } = await axios.patch(`/api/v1/services/prices/${priceId}`, {
        name: payload?.name ?? "",
        priceType: payload?.priceType ?? "TIME_BASED",
        billingUnit: payload?.billingUnit ?? "DAY",
        amount: payload?.amount ?? 0,
        currency: payload?.currency ?? "USD",
        isDefault: Boolean(payload?.isDefault),
        minUnits: payload?.minUnits ?? 1,
        maxUnits: payload?.maxUnits ?? 1,
        status: safeStatus,
    });

    return extractCollectionPayload(data);
};

export const uploadServiceGalleryImage = async (serviceId, file) => {
    const formData = new FormData();
    formData.append("files", file);

    const { data } = await axios.post(`/api/v1/services/${serviceId}/gallery`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return extractCollectionPayload(data);
};

export const updateServiceGalleryFile = async (serviceId, serviceMediaId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.put(`/api/v1/services/${serviceId}/gallery/${serviceMediaId}/file`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return extractCollectionPayload(data);
};

export const updateServiceGallerySortOrder = async (serviceId, serviceMediaId, sortOrder) => {
    const { data } = await axios.patch(`/api/v1/services/${serviceId}/gallery/${serviceMediaId}/sort-order`, {
        sortOrder,
    });

    return extractCollectionPayload(data);
};

export const fetchAdminServices = async ({
    keyword = "",
    status = "ACTIVE",
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/admin/services", {
        params: {
            keyword,
            status,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    return {
        items: items.map((item) => ({
            ...item,
            imageUrl: getServiceImage(item),
        })),
        pageNumber: payload?.pageNumber ?? payload?.number ?? pageNumber,
        pageSize: payload?.pageSize ?? payload?.size ?? pageSize,
        totalElements: payload?.totalElements ?? payload?.totalItems ?? items.length,
        totalPages: payload?.totalPages ?? 0,
        lastPage: payload?.lastPage ?? true,
    };
};

export const fetchProviderServices = async ({
    keyword = "",
    pageNumber = 0,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "desc",
} = {}) => {
    const { data } = await axios.get("/api/v1/services", {
        params: {
            keyword,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder,
        },
    });

    const payload = extractCollectionPayload(data);
    const items = extractCollectionItems(payload);

    return {
        items: items.map((item) => ({
            ...item,
            imageUrl: getServiceImage(item),
        })),
        pageNumber: payload?.pageNumber ?? payload?.number ?? pageNumber,
        pageSize: payload?.pageSize ?? payload?.size ?? pageSize,
        totalElements: payload?.totalElements ?? payload?.totalItems ?? items.length,
        totalPages: payload?.totalPages ?? 0,
        lastPage: payload?.lastPage ?? true,
    };
};

export const fetchProviderServiceById = async (serviceId) => {
    const { data } = await axios.get(`/api/v1/services/${serviceId}`);
    const payload = extractSingleItem(extractCollectionPayload(data));

    if (!payload || typeof payload !== "object") {
        return null;
    }

    return {
        ...payload,
        imageUrl: getServiceImage(payload),
    };
};

export const uploadAdminProviderAvatar = async (providerId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(`/api/v1/admin/providers/${providerId}/avatar`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return extractCollectionPayload(data);
};




// For Home Page API
export const fetchCategories = async () => {
    const { data } = await axios.get("/api/v1/public/categories");

    const categories = Array.isArray(data) ? data : data?.data;

    if (!Array.isArray(categories)) {
        return [];
    }

    return categories
        .filter((category) => category?.status === "ACTIVE")
        .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
        .map((category) => {
            const fallbackCategory = DEFAULT_CATEGORIES.find(
                (item) => item.slug === category.slug,
            );

            return {
                id: category.id,
                slug: category.slug,
                name: category.name,
                description: category.description,
                imageUrl: category.imageUrl,
                image:
                    resolveAssetUrl(category.imageUrl) ||
                    fallbackCategory?.image ||
                    "/empty-img.png",
            };
        });
};

export const fetchSubcategories = async () => {
    const { data } = await axios.get("/api/v1/public/sub-categories");

    const subcategories = Array.isArray(data) ? data : data?.data;

    if (!Array.isArray(subcategories)) {
        return [];
    }

    return subcategories
        .filter((subcategory) => subcategory?.status === "ACTIVE")
        .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
        .map((subcategory) => {
            const fallbackSubcategory = DEFAULT_SUBCATEGORIES.find(
                (item) => item.slug === subcategory.slug,
            );

            return {
                id: subcategory.id,
                categoryId: subcategory.categoryId,
                slug: subcategory.slug,
                name: subcategory.name,
                description: subcategory.description || fallbackSubcategory?.description,
            };
        });
};


export const createProvider = async (payload) => {
    const response = await axios.post("/api/v1/providers", payload);
    return response.data;
};

export const uploadProviderAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/v1/providers/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};
