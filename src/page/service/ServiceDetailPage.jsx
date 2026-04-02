import ServiceGallery from "../../components/services/ServiceGallery";
import ServicePriceList from "../../components/services/ServicePriceList";
import ServiceProviderInfo from "../../components/services/ServiceProviderInfo";
import ServiceLocationMap from "../../components/services/ServiceLocationMap";
import ServiceSummary from "../../components/services/ServiceSummary";
import ServiceDetailSkeleton from "../../components/services/ServiceDetailSkeleton";
import ServiceRecommendations from "../../components/services/ServiceRecommendations";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMediaUrl, getServiceMediaItems, matchesServiceKey } from "../../utils/service";
import { fetchPublicServices } from "../../api";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const activeService = services.find((item) => matchesServiceKey(item, slug || ""));
  const pricingService = activeService || services[0] || null;
  const serviceImages = getServiceMediaItems(pricingService).map(getMediaUrl).filter(Boolean);
  const galleryImages = [...new Set(serviceImages)];

  useEffect(() => {
    setIsLoading(true);

    let isMounted = true;

    const loadServices = async () => {
      try {
        const result = await fetchPublicServices({
          keyword: "",
          pageNumber: 0,
          pageSize: 100,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (!isMounted) {
          return;
        }

        setServices(result.items?.length ? result.items : DEFAULT_SERVICES);
      } catch (error) {
        console.error("Failed to load service detail data:", error);
        if (isMounted) {
          setServices(DEFAULT_SERVICES);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [slug]);

  let currentLabel = "";
  if (slug) {
    try {
      currentLabel = activeService?.title || decodeURIComponent(slug);
    } catch {
      currentLabel = activeService?.title || slug;
    }
  }

  if (isLoading) return <ServiceDetailSkeleton />;

  return (
    <main className="flex-1 px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <Breadcrumb
        className="service-detail-enter mb-4"
        currentLabel={currentLabel || undefined}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <ServiceGallery
            images={galleryImages}
            totalCount={galleryImages.length}
            className="service-detail-enter"
          />

          <ServiceSummary
            title={pricingService?.title}
            description={pricingService?.description}
            className="service-detail-enter"
          />

          <ServiceLocationMap
            service={pricingService}
            className="service-detail-enter"
          />
        </div>

        <div className="space-y-4">
          <ServicePriceList
            key={pricingService?.id || "default-service-price"}
            service={pricingService}
          />

          <ServiceProviderInfo
            service={pricingService}
            className="service-detail-enter"
          />
        </div>
      </section>

      <ServiceRecommendations
        className="service-detail-enter mt-6"
        currentService={pricingService}
        services={services}
      />
    </main>
  );
}
