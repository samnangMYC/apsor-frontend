import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Category from "../../components/shared/Category";
import NearestService from "../../components/shared/NearestService";
import HeroSwiper from "../../components/shared/HeroSwiper";
import ServiceList from "../../components/shared/ServiceList";
import { fetchPublicServices } from "../../api";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const keyword = String(searchParams.get("keyword") || "").trim();

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const result = await fetchPublicServices({
          keyword,
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
  }, [keyword]);

  return (
    <main className="flex-1 px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <HeroSwiper />
      <Category />
      <ServiceList services={services} />
      <NearestService services={services} />
    </main>
  );
};

export default HomePage;
