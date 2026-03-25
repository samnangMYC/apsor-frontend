import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Category from "../../components/shared/Category";
import NearestService from "../../components/shared/NearestService";
import HeroSwiper from "../../components/shared/HeroSwiper";
import ServiceList from "../../components/shared/ServiceList";
import { fetchPublicServices } from "../../api";

const ALLOWED_SERVICE_STATUSES = new Set(["DRAFT", "ACTIVE", "SUSPENDED", "ARCHIVED"]);

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const keyword = String(searchParams.get("keyword") || "").trim();
  const requestedStatus = String(searchParams.get("status") || "").trim().toUpperCase();
  const status = ALLOWED_SERVICE_STATUSES.has(requestedStatus) ? requestedStatus : "ACTIVE";

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const result = await fetchPublicServices({
          keyword,
          status,
          pageNumber: 0,
          pageSize: 10,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (isMounted) {
          setServices(result.items);
        }
      } catch (error) {
        console.error("Failed to load homepage services:", error);
        if (isMounted) {
          setServices([]);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [keyword, status]);

  return (
    <main className="flex-1 px-6 sm:pt-2 pb-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <HeroSwiper />
      <Category />
      <ServiceList services={services} />
      <NearestService services={services} />
    </main>
  );
};

export default HomePage;
