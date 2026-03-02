import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const GLOBAL_LABEL_MAP = {
  "/": "Home",
  "/services": "Services",
  "/categories": "Categories",
  "/signin": "Sign In",
  "/signup": "Sign Up",
};

function formatLabel(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function decodePathSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return String(value || "");
  }
}

export default function Breadcrumb({
  items = [],
  className = "",
  labelMap = {},
  homeLabel = "Home",
  currentLabel,
}) {
  const location = useLocation();
  const resolvedItems = useMemo(() => {
    if (items.length) return items;

    const mergedLabelMap = {
      ...GLOBAL_LABEL_MAP,
      ...labelMap,
    };
    const segments = location.pathname.split("/").filter(Boolean);
    const autoItems = [{ label: homeLabel, to: "/" }];
    let path = "";

    segments.forEach((segment, index) => {
      path += `/${segment}`;
      const isLast = index === segments.length - 1;
      const decodedSegment = decodePathSegment(segment);
      const label =
        mergedLabelMap[path]
        || mergedLabelMap[decodedSegment]
        || formatLabel(decodedSegment);

      autoItems.push({
        label,
        to: isLast ? undefined : path,
      });
    });

    if (currentLabel && autoItems.length) {
      autoItems[autoItems.length - 1] = {
        ...autoItems[autoItems.length - 1],
        label: currentLabel,
      };
    }

    return autoItems;
  }, [currentLabel, homeLabel, items, labelMap, location.pathname]);

  if (!resolvedItems.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <div className="inline-flex items-center gap-2 rounded-pill border border-border bg-bg-surface px-3 py-2 text-sm text-text-secondary">
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;

          return (
            <div key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="font-semibold hover:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-text-primary">{item.label}</span>
              )}

              {!isLast && <span>/</span>}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
