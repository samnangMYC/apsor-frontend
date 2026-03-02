import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import ServiceGallery from "../components/services/ServiceGallery";
import ServicePriceList from "../components/services/ServicePriceList";
import Breadcrumb from "../components/shared/Breadcrumb";
import { DEFAULT_SERVICES } from "../data/defaultServices";
import { useParams } from "react-router-dom";
import { getMediaUrl, getServiceMediaItems, matchesServiceKey } from "../utils/service";

const FALLBACK_GALLERY_IMAGES = [
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/720014183.jpg?k=95fdf8f436e7e6cda03098b09fd4c751a1f27feb38f8d4499fb2eae350835ade&o=",
  "https://www.chemtronics.com/content/images/thumbs/0002335_electronic-repair-how-to-guide.jpeg",
  "https://media.odynovotours.com/article/48000/AngkorWat2_45100.jpg",
  "https://img.galaxymacau.com/media_library/spa-main.png?x-oss-process=image/resize%2Cm_lfit%2Cw_1920%2Climit_0/format%2Cwebp/quality%2Cq_75",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb21090?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
];

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const activeService = DEFAULT_SERVICES.find((item) => matchesServiceKey(item, slug || ""));
  const pricingService = activeService || DEFAULT_SERVICES[0] || null;
  const serviceImages = DEFAULT_SERVICES.flatMap(getServiceMediaItems).map(getMediaUrl).filter(Boolean);
  const galleryImages = [...new Set([...serviceImages, ...FALLBACK_GALLERY_IMAGES])];
  let currentLabel = "";
  if (slug) {
    try {
      currentLabel = activeService?.title || decodeURIComponent(slug);
    } catch {
      currentLabel = activeService?.title || slug;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-app">
      <Header user={true} />
      <main className="flex-1 px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={currentLabel || undefined} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <ServiceGallery
              images={galleryImages}
              totalCount={galleryImages.length + 4}
            />

            <article className="rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">

              <h1 className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">
                {pricingService?.title || "Service title"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {pricingService?.description || "No description available."}
              </p>
            </article>
          </div>

          <ServicePriceList
            key={pricingService?.id || "default-service-price"}
            service={pricingService}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
