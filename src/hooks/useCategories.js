// src/hooks/useCategories.js
import React from "react";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";

const KEY = "apsor:categories";

export function useCategories() {
  const [categories, setCategories] = React.useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  React.useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (cat) => setCategories((prev) => [{ ...cat }, ...prev]);

  const updateCategory = (id, patch) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const deleteCategory = (id) => setCategories((prev) => prev.filter((c) => c.id !== id));

  return { categories, addCategory, updateCategory, deleteCategory, setCategories };
}