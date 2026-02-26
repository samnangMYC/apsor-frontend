import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLang } from "../i18n/useLang";

function pickLang(val, lang) {
  // val can be: string OR { km, en }
  if (!val) return "";
  if (typeof val === "string") return val;
  return val?.[lang] ?? val?.km ?? val?.en ?? "";
}

export default function HeroSwiper({
  slides = DEFAULT_SLIDES,
  className = "",
  autoplay = true,
}) {
  const { lang, t } = useLang("km");

  // Unique selectors per component instance
  const uid = React.useId().replace(/:/g, "");
  const prevClass = `hero-prev-${uid}`;
  const nextClass = `hero-next-${uid}`;

  return (
    <div className={`relative ${className} `}>
      {/* Custom Nav Buttons */}
      <button
        type="button"
        className={`${prevClass} absolute left-3 top-1/2 z-10 -translate-y-1/2 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/55`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        className={`${nextClass} absolute right-3 top-1/2 z-10 -translate-y-1/2 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/55`}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        loop
        speed={650}
        slidesPerView={1}
        a11y={{ enabled: true }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: `.${prevClass}`,
          nextEl: `.${nextClass}`,
        }}
        autoplay={
          autoplay
            ? {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        className="rounded-xl overflow-hidden"
      >
        {slides.map((s) => {
          const title = pickLang(s.title, lang);
          const subtitle = pickLang(s.subtitle, lang);
          const ctaText = pickLang(s.ctaText, lang) || t.searchButton;

          return (
            <SwiperSlide key={s.id}>
              <div className="relative h-48 px-8 sm:h-60 md:h-72">
                {/* Background image */}
                <img
                  src={s.image}
                  alt={title || "slide"}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/40 to-black/10" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="px-5 sm:px-8 md:px-12 max-w-2xl">
                    <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm text-white backdrop-blur">
                      {pickLang(s.badge, lang)}
                    </p>

                    <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {title}
                    </h2>

                    {subtitle ? (
                      <p className="mt-3 text-sm sm:text-base text-white/90">
                        {subtitle}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {s.href ? (
                        <a
                          href={s.href}
                          className="inline-flex h-10 items-center rounded-pill bg-linear-to-r from-brand to-brand-hover px-5 text-sm font-semibold text-white shadow-1 transition hover:brightness-105 active:brightness-95"
                        >
                          {ctaText}
                        </a>
                      ) : null}

                      {s.secondaryHref ? (
                        <a
                          href={s.secondaryHref}
                          className="inline-flex h-10 items-center rounded-pill border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
                        >
                          {pickLang(s.secondaryText, lang) || "Learn more"}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Small Swiper bullet styling (works with your tokens too) */}
      <style>{`
        .swiper-pagination-bullets { bottom: 14px !important; }
        .swiper-pagination-bullet {
          width: 8px; height: 8px; opacity: .45;
        }
        .swiper-pagination-bullet-active { opacity: 1; }
      `}</style>
    </div>
  );
}

const DEFAULT_SLIDES = [
  {
    id: "s1",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/720014183.jpg?k=95fdf8f436e7e6cda03098b09fd4c751a1f27feb38f8d4499fb2eae350835ade&o=",
    badge: { km: "ប្រភេទសេវាកម្មពេញនិយម", en: "Popular service category" },
    title: { km: "Hospitality", en: "Hospitality" },
    subtitle: {
      km: "សេវាសណ្ឋាគារ ផ្ទះសំណាក់ និងភោជនីយដ្ឋាន។",
      en: "Hotel, guesthouse, and restaurant related services.",
    },
    href: "/services?search=hospitality",
    ctaText: { km: "មើលសេវាកម្ម", en: "View services" },
  },
  {
    id: "s2",
    image:
      "https://www.chemtronics.com/content/images/thumbs/0002335_electronic-repair-how-to-guide.jpeg",
    badge: { km: "ជួសជុលឧបករណ៍អេឡិចត្រូនិក", en: "Electronics repair" },
    title: { km: "Phone/Laptop Repair", en: "Phone/Laptop Repair" },
    subtitle: {
      km: "ជួសជុលទូរស័ព្ទ និងកុំព្យូទ័រយួរដៃដោយអ្នកជំនាញ។",
      en: "Professional repair services for phones and laptops.",
    },
    href: "/services?search=phone%20laptop%20repair",
    ctaText: { km: "កក់ឥឡូវ", en: "Book now" },
  },
  {
    id: "s3",
    image:
      "https://media.odynovotours.com/article/48000/AngkorWat2_45100.jpg",
    badge: { km: "សេវាកម្មធ្វើដំណើរ", en: "Travel services" },
    title: { km: "Tourism Services", en: "Tourism Services" },
    subtitle: {
      km: "មគ្គុទ្ទេសក៍ ទស្សនកិច្ច និងសេវាជូនដំណើរ។",
      en: "Guides, local tours, and travel support services.",
    },
    href: "/services?search=tourism",
    ctaText: { km: "ស្វែងរក", en: "Explore" },
  },
  {
    id: "s4",
    image:
      "https://img.galaxymacau.com/media_library/spa-main.png?x-oss-process=image/resize%2Cm_lfit%2Cw_1920%2Climit_0/format%2Cwebp/quality%2Cq_75",
    badge: { km: "សុខុមាលភាព និងសម្រស់", en: "Wellness & beauty" },
    title: { km: "Massage & Spa", en: "Massage & Spa" },
    subtitle: {
      km: "សេវាម៉ាស្សា និងស្ប៉ាសម្រាប់ការសម្រាក និងសុខភាព។",
      en: "Massage and spa services for relaxation and wellness.",
    },
    href: "/services?search=massage%20spa",
    ctaText: { km: "មើលអ្នកផ្តល់សេវា", en: "See providers" },
  },
];
