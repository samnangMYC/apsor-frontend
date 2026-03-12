import { create } from "zustand";
import { fetchCategories, fetchSubcategories } from "../api";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";

export const useCategoryStore = create((set, get) => ({
  categories: null,
  subcategories: null,
  categoryStatus: "idle",
  subcategoryStatus: "idle",
  categoryError: null,
  subcategoryError: null,
  fetchCategories: async () => {
    const { categoryStatus } = get();

    if (categoryStatus === "loading") {
      return;
    }

    set({ categoryStatus: "loading", categoryError: null });

    try {
      const categories = await fetchCategories();

      set({
        categories: categories.length ? categories : DEFAULT_CATEGORIES,
        categoryStatus: "success",
        categoryError: null,
      });
    } catch (error) {
      set({
        categories: DEFAULT_CATEGORIES,
        categoryStatus: "error",
        categoryError: error,
      });
    }
  },
  fetchSubcategories: async () => {
    const { subcategoryStatus } = get();

    if (subcategoryStatus === "loading") {
      return;
    }

    set({ subcategoryStatus: "loading", subcategoryError: null });

    try {
      const subcategories = await fetchSubcategories();

      set({
        subcategories: subcategories.length ? subcategories : DEFAULT_SUBCATEGORIES,
        subcategoryStatus: "success",
        subcategoryError: null,
      });
    } catch (error) {
      set({
        subcategories: DEFAULT_SUBCATEGORIES,
        subcategoryStatus: "error",
        subcategoryError: error,
      });
    }
  },
}));
