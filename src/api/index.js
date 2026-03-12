import axios from "./api";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";
import { appendAssetVersion, resolveAssetUrl } from "../utils/assets";

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

export const signIn = async (payload) => {
    const { data } = await axios.post("/api/v1/auth/signin", payload);
    return data;
};

export const signUp = async (payload) => {
    const { data } = await axios.post("/api/v1/auth/signup", payload);
    return data;
};

export const createCustomer = async (payload, accessToken = "") => {
    const { data } = await axios.post("/api/v1/customers", payload, {
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
