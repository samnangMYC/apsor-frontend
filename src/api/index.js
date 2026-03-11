import axios from "./api";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";

export const fetchCategories = async () => {
    const { data } = await axios.get("/api/v1/categories");

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
                image:
                    category.imageUrl ||
                    fallbackCategory?.image ||
                    "/empty-img.png",
            };
        });
};

export const fetchSubcategories = async () => {
    const { data } = await axios.get("/api/v1/sub-categories");

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
