import ServiceListCard from "./services/ServiceListCard";
import { Link } from "react-router-dom";
import { useLang } from "../i18n/useLang";

const DEFAULT_SERVICES = [
  {
    id: 1,
    publicId: "17a8b512-f343-48ae-9ae1-dd74bd4d11c0",
    title: "Apartment Deep Cleaning",
    slug: "apartment-deep-cleaning",
    description:
      "Professional deep cleaning for condos and apartments including kitchen, bathroom, and glass surfaces.",
    categoryId: 1,
    subCategoryId: 2,
    providerId: 2,
    locationMode: "ONSITE",
    ratingAvg: 4.8,
    ratingCount: 136,
    status: "ACTIVE",
    publishedAt: "2026-02-25T11:45:25.937442Z",
    createdAt: "2026-02-25T11:45:25.941382Z",
    updatedAt: "2026-02-25T11:45:25.941391Z",
    suspendedAt: null,
    price: [
      {
        id: 1,
        name: "Standard Room",
        priceType: "TIME_BASED",
        billingUnit: "DAY",
        amount: 85,
        currency: "USD",
        isDefault: true,
        status: "ACTIVE",
        minUnits: 1,
        maxUnits: 2,
        createdAt: "2026-02-25T12:44:25.730818Z",
        updatedAt: "2026-02-25T12:44:25.730828Z",
      },
    ],
    availability: [
      {
        capacityPerSlot: 5,
        createdAt: "2026-02-25T12:21:14.226605Z",
        endTime: "17:00",
        id: 1,
        isDefault: false,
        openDaysMask: 127,
        serviceId: 1,
        slotDurationMinutes: 30,
        startTime: "09:00",
        status: "ACTIVE",
        timezone: "Asia/Phnom_Penh",
        updatedAt: "2026-02-25T12:21:14.226632Z",
      },
    ],
    media: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    location: [
      {
        city: "Phnom Penh",
        createdAt: "2026-02-25T12:25:49.504808Z",
        district: "Daun Penh",
        id: 1,
        isDefault: false,
        latitude: 11.5564,
        line1: "123 Sample Street",
        line2: "Apartment 456",
        longitude: 104.9282,
        postalCode: "12000",
        province: "Phnom Penh",
        updatedAt: "2026-02-25T12:25:49.50482Z",
      },
    ],
  },
  {
    id: 2,
    publicId: "0ed3e70f-5dd3-4181-87aa-f5cb237f2f6d",
    title: "AC Maintenance & Repair",
    slug: "ac-maintenance-repair",
    description:
      "Full AC maintenance service with filter cleaning, gas pressure checks, and troubleshooting.",
    categoryId: 3,
    subCategoryId: 8,
    providerId: 7,
    locationMode: "ONSITE",
    ratingAvg: 4.7,
    ratingCount: 89,
    status: "ACTIVE",
    publishedAt: "2026-02-24T09:12:11.000000Z",
    createdAt: "2026-02-24T09:12:11.000000Z",
    updatedAt: "2026-02-24T09:12:11.000000Z",
    suspendedAt: null,
    price: [
      {
        id: 2,
        name: "Per Visit",
        priceType: "FIXED",
        billingUnit: "JOB",
        amount: 35,
        currency: "USD",
        isDefault: true,
        status: "ACTIVE",
        minUnits: 1,
        maxUnits: 1,
        createdAt: "2026-02-24T09:13:11.000000Z",
        updatedAt: "2026-02-24T09:13:11.000000Z",
      },
    ],
    availability: [
      {
        capacityPerSlot: 3,
        createdAt: "2026-02-24T09:14:11.000000Z",
        endTime: "18:00",
        id: 2,
        isDefault: true,
        openDaysMask: 62,
        serviceId: 2,
        slotDurationMinutes: 60,
        startTime: "10:00",
        status: "ACTIVE",
        timezone: "Asia/Phnom_Penh",
        updatedAt: "2026-02-24T09:14:11.000000Z",
      },
    ],
    media: [
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    location: [
      {
        city: "Phnom Penh",
        createdAt: "2026-02-24T09:15:11.000000Z",
        district: "Tuol Kork",
        id: 2,
        isDefault: true,
        latitude: 11.5796,
        line1: "Street 265",
        line2: "",
        longitude: 104.9027,
        postalCode: "12151",
        province: "Phnom Penh",
        updatedAt: "2026-02-24T09:15:11.000000Z",
      },
    ],
  },
  {
    id: 3,
    publicId: "fe577426-e3ec-472d-ac88-f2e4c905af86",
    title: "Online Interior Design Consultation",
    slug: "online-interior-design-consultation",
    description:
      "Remote consultation to improve room layout, furniture selection, and styling based on your budget.",
    categoryId: 5,
    subCategoryId: 12,
    providerId: 10,
    locationMode: "REMOTE",
    ratingAvg: 4.9,
    ratingCount: 57,
    status: "ACTIVE",
    publishedAt: "2026-02-23T14:35:00.000000Z",
    createdAt: "2026-02-23T14:35:00.000000Z",
    updatedAt: "2026-02-23T14:35:00.000000Z",
    suspendedAt: null,
    price: [
      {
        id: 3,
        name: "Consultation Session",
        priceType: "TIME_BASED",
        billingUnit: "HOUR",
        amount: 20,
        currency: "USD",
        isDefault: true,
        status: "ACTIVE",
        minUnits: 1,
        maxUnits: 3,
        createdAt: "2026-02-23T14:36:00.000000Z",
        updatedAt: "2026-02-23T14:36:00.000000Z",
      },
    ],
    availability: [
      {
        capacityPerSlot: 8,
        createdAt: "2026-02-23T14:37:00.000000Z",
        endTime: "21:00",
        id: 3,
        isDefault: true,
        openDaysMask: 127,
        serviceId: 3,
        slotDurationMinutes: 45,
        startTime: "13:00",
        status: "ACTIVE",
        timezone: "Asia/Phnom_Penh",
        updatedAt: "2026-02-23T14:37:00.000000Z",
      },
    ],
    media: [
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1616627451159-0f6361f3d2d0?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    location: [
      {
        city: "Phnom Penh",
        createdAt: "2026-02-23T14:38:00.000000Z",
        district: "Boeung Keng Kang",
        id: 3,
        isDefault: true,
        latitude: 11.5445,
        line1: "Remote Service",
        line2: "",
        longitude: 104.9234,
        postalCode: "12301",
        province: "Phnom Penh",
        updatedAt: "2026-02-23T14:38:00.000000Z",
      },
    ],
  },
  {
    id: 4,
    publicId: "b889b80e-feef-4a21-b8f4-6d5ec34f6d36",
    title: "Photography Session (Studio + Outdoor)",
    slug: "photography-session-studio-outdoor",
    description:
      "Hybrid photo service for portraits, products, and events with edited high-resolution outputs.",
    categoryId: 7,
    subCategoryId: 19,
    providerId: 14,
    locationMode: "HYBRID",
    ratingAvg: 4.5,
    ratingCount: 41,
    status: "ACTIVE",
    publishedAt: "2026-02-22T07:25:00.000000Z",
    createdAt: "2026-02-22T07:25:00.000000Z",
    updatedAt: "2026-02-22T07:25:00.000000Z",
    suspendedAt: null,
    price: [
      {
        id: 4,
        name: "Half Day Package",
        priceType: "TIME_BASED",
        billingUnit: "DAY",
        amount: 140,
        currency: "USD",
        isDefault: true,
        status: "ACTIVE",
        minUnits: 1,
        maxUnits: 2,
        createdAt: "2026-02-22T07:26:00.000000Z",
        updatedAt: "2026-02-22T07:26:00.000000Z",
      },
    ],
    availability: [
      {
        capacityPerSlot: 2,
        createdAt: "2026-02-22T07:27:00.000000Z",
        endTime: "19:00",
        id: 4,
        isDefault: true,
        openDaysMask: 95,
        serviceId: 4,
        slotDurationMinutes: 120,
        startTime: "09:00",
        status: "ACTIVE",
        timezone: "Asia/Phnom_Penh",
        updatedAt: "2026-02-22T07:27:00.000000Z",
      },
    ],
    media: [
      {
        id: 4,
        url: "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    location: [
      {
        city: "Phnom Penh",
        createdAt: "2026-02-22T07:28:00.000000Z",
        district: "Chbar Ampov",
        id: 4,
        isDefault: true,
        latitude: 11.5203,
        line1: "National Road 1",
        line2: "",
        longitude: 104.965,
        postalCode: "12357",
        province: "Phnom Penh",
        updatedAt: "2026-02-22T07:28:00.000000Z",
      },
    ],
  },
];

function countByMode(services) {
  return services.reduce(
    (acc, service) => {
      const mode = service.locationMode || "UNKNOWN";
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    },
    { ONSITE: 0, REMOTE: 0, HYBRID: 0 }
  );
}

export default function ServiceList({
  services = DEFAULT_SERVICES,
  title,
  subtitle,
}) {
  const { t } = useLang("km");
  const modeStats = countByMode(services);

  return (
    <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {t.freshListings || "Fresh listings"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
            {title || t.servicesForYou || "Services For You"}
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            {subtitle || t.servicesSubtitle || "Compare availability, location and service quality at a glance."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/services"
            className="rounded-pill bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
          >
            {t.viewAll || "View all"}
          </Link>
        </div>
      </div>


      {services.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceListCard
              key={service.id}
              service={service}
              to={`/services?slug=${service.slug}`}
            />
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
