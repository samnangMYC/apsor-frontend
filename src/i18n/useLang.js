// src/i18n/useLang.js
import React from "react";
import { DICT } from "./dict";

const LANG_KEY = "lang";
const LANG_EVENT = "apsor:lang";

export function useLang(defaultLang = "km") {
  const [lang, setLangState] = React.useState(() => {
    return localStorage.getItem(LANG_KEY) || defaultLang;
  });

  const setLang = React.useCallback((next) => {
    setLangState(next);
  }, []);

  // persist + set <html lang="..."> + notify other hook instances
  React.useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
  }, [lang]);

  // listen for changes from other components (same tab)
  React.useEffect(() => {
    const handler = (e) => {
      const next = e?.detail;
      if (next && next !== lang) setLangState(next);
    };
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, [lang]);

  // listen for other tabs
  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LANG_KEY) return;
      const next = e.newValue || defaultLang;
      if (next !== lang) setLangState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [lang, defaultLang]);

  return { lang, setLang, t: DICT[lang] || DICT.km };
}