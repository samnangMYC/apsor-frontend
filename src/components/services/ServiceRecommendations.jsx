import ServiceListCard from "./ServiceListCard";
import { useLang } from "../../i18n/useLang";

const UI_TEXT = {
  en: {
    recommendedTitle: "Recommended Services",
    recommendedSubtitle: "Similar services you may want to compare before ordering.",
  },
  km: {
    recommendedTitle: "សេវាកម្មដែលបានណែនាំ",
    recommendedSubtitle: "សេវាកម្មស្រដៀងគ្នាដែលអ្នកអាចប្រៀបធៀបមុនពេលបញ្ជាទិញ។",
  },
};

export default function ServiceRecommendations({ currentService, services = [], className = "" }) {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const recommendedServices = (services || [])
    .filter((item) => item?.id !== currentService?.id)
    .sort((a, b) => {
      const sameCategoryA = Number(a?.categoryId === currentService?.categoryId);
      const sameCategoryB = Number(b?.categoryId === currentService?.categoryId);
      if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;

      const ratingGap = Number(b?.ratingAvg || 0) - Number(a?.ratingAvg || 0);
      if (ratingGap !== 0) return ratingGap;
      return Number(b?.ratingCount || 0) - Number(a?.ratingCount || 0);
    })
    .slice(0, 4);

  return (
    <section
      className={`rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5 ${className}`}
    >
      <div className="mb-4">

        <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
          {text.recommendedTitle}
        </h2>
        <p className="mt-1 text-xs text-text-muted sm:text-sm">
          {text.recommendedSubtitle}
        </p>
      </div>

      {recommendedServices.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recommendedServices.map((service) => (
            <ServiceListCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-sm text-text-muted">
          {t.noServicesFound || "No services found."}
        </div>
      )}
    </section>
  );
}
