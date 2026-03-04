import { useMemo, useState } from "react";
import {
  CalendarClock,
  FileText,
  ImagePlus,
  Images,
  MapPin,
  Plus,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";
import AuthStepProgress from "../components/auth/AuthStepProgress";
import Breadcrumb from "../components/shared/Breadcrumb";
import { useLang } from "../i18n/useLang";
import { formatBillingUnit, SERVICE_PRICE_BILLING_UNITS } from "../utils/pricing";

const UI_TEXT = {
  en: {
    title: "Upload Service",
    subtitle: "Create a service in steps: summary, availability, location, price, and gallery.",
    stepSummary: "Summary",
    stepAvailability: "Availability",
    stepLocation: "Location",
    stepPrice: "Price options",
    stepGallery: "Gallery",
    summaryTitle: "Service summary",
    serviceTitle: "Service title",
    serviceTitlePlaceholder: "Deep cleaning for apartment and condo",
    description: "Description",
    descriptionPlaceholder:
      "Write what is included, who this service is for, and any important conditions.",
    availabilityTitle: "Availability",
    scheduleType: "Schedule type",
    flexibleSchedule: "Flexible schedule",
    fixedHours: "Fixed working hours",
    workingDays: "Working days",
    startTime: "Start time",
    endTime: "End time",
    slotDuration: "Slot duration (minutes)",
    capacityPerSlot: "Capacity per slot",
    locationTitle: "Service location",
    city: "City",
    cityPlaceholder: "Phnom Penh",
    address: "Address",
    addressPlaceholder: "House number, street, sangkat, khan",
    googleMap: "Google map",
    googleMapHint: "Map preview updates automatically from city and address.",
    priceTitle: "Price options",
    optionName: "Option name",
    optionNamePlaceholder: "Standard package",
    priceAmount: "Amount (USD)",
    billingUnit: "Billing unit",
    defaultOption: "Default",
    setDefault: "Set default",
    addOption: "Add price option",
    galleryTitle: "Service gallery",
    galleryHint: "Upload service photos to increase trust. JPG, PNG, WEBP up to 4MB each.",
    uploadImages: "Upload images",
    addMoreImages: "Add more images",
    previewMap: "Preview map",
    stepLabel: "Step",
    completionLabel: "Completion",
    requiredSummary: "Please complete service title and description.",
    requiredAvailability: "Please complete availability details.",
    invalidWorkingHours: "End time must be later than start time.",
    requiredLocation: "Please complete city and address.",
    requiredPrice: "Please provide at least one valid price option.",
    requiredGallery: "Please upload at least one gallery image.",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Each image must be 4MB or less.",
    maxGalleryFiles: "You can upload up to 8 images.",
    backStep: "Back",
    nextStep: "Next",
    submit: "Save service",
    success: "Service draft saved successfully.",
    remove: "Remove",
  },
  km: {
    title: "បញ្ចូលសេវាកម្ម",
    subtitle: "បង្កើតសេវាកម្មតាមជំហាន៖ សង្ខេប ពេលវេលា ទីតាំង តម្លៃ និងវិចិត្រសាល។",
    stepSummary: "សង្ខេប",
    stepAvailability: "ពេលវេលាផ្តល់សេវា",
    stepLocation: "ទីតាំង",
    stepPrice: "ជម្រើសតម្លៃ",
    stepGallery: "វិចិត្រសាល",
    summaryTitle: "សេចក្តីសង្ខេបសេវាកម្ម",
    serviceTitle: "ចំណងជើងសេវាកម្ម",
    serviceTitlePlaceholder: "សម្អាតជម្រៅសម្រាប់អាផាតមិន និងខុនដូ",
    description: "ពិពណ៌នា",
    descriptionPlaceholder:
      "សរសេរអំពីអ្វីដែលមានក្នុងសេវាកម្ម នរណាដែលសមស្រប និងលក្ខខណ្ឌសំខាន់ៗ។",
    availabilityTitle: "ពេលវេលាផ្តល់សេវា",
    scheduleType: "ប្រភេទពេលវេលា",
    flexibleSchedule: "ពេលវេលាបត់បែន",
    fixedHours: "ម៉ោងធ្វើការកំណត់",
    workingDays: "ថ្ងៃធ្វើការ",
    startTime: "ម៉ោងចាប់ផ្តើម",
    endTime: "ម៉ោងបញ្ចប់",
    slotDuration: "រយៈពេល/វគ្គ (នាទី)",
    capacityPerSlot: "ចំនួនទទួលបាន/វគ្គ",
    locationTitle: "ទីតាំងសេវាកម្ម",
    city: "ទីក្រុង",
    cityPlaceholder: "ភ្នំពេញ",
    address: "អាសយដ្ឋាន",
    addressPlaceholder: "លេខផ្ទះ ផ្លូវ សង្កាត់ ខណ្ឌ",
    googleMap: "ផែនទី Google",
    googleMapHint: "ផែនទីនឹងបង្ហាញដោយស្វ័យប្រវត្តិ ពីទីក្រុង និងអាសយដ្ឋាន។",
    priceTitle: "ជម្រើសតម្លៃ",
    optionName: "ឈ្មោះជម្រើស",
    optionNamePlaceholder: "កញ្ចប់ស្តង់ដារ",
    priceAmount: "តម្លៃ (USD)",
    billingUnit: "ឯកតាគិតតម្លៃ",
    defaultOption: "លំនាំដើម",
    setDefault: "កំណត់ជាលំនាំដើម",
    addOption: "បន្ថែមជម្រើសតម្លៃ",
    galleryTitle: "វិចិត្រសាលសេវាកម្ម",
    galleryHint: "បញ្ចូលរូបភាពសេវាកម្មដើម្បីបង្កើនការទុកចិត្ត។ JPG, PNG, WEBP ទំហំតិចជាង 4MB។",
    uploadImages: "បញ្ចូលរូបភាព",
    addMoreImages: "បន្ថែមរូបភាព",
    previewMap: "មើលផែនទី",
    stepLabel: "ជំហាន",
    completionLabel: "ការបំពេញ",
    requiredSummary: "សូមបំពេញចំណងជើងសេវាកម្ម និងពិពណ៌នា។",
    requiredAvailability: "សូមបំពេញព័ត៌មានពេលវេលាផ្តល់សេវា។",
    invalidWorkingHours: "ម៉ោងបញ្ចប់ត្រូវតែធំជាងម៉ោងចាប់ផ្តើម។",
    requiredLocation: "សូមបំពេញទីក្រុង និងអាសយដ្ឋាន។",
    requiredPrice: "សូមបញ្ចូលជម្រើសតម្លៃត្រឹមត្រូវយ៉ាងហោចណាស់ ១។",
    requiredGallery: "សូមបញ្ចូលរូបភាពវិចិត្រសាលយ៉ាងហោចណាស់ ១។",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "រូបភាពនីមួយៗត្រូវតិចជាង ឬស្មើ 4MB។",
    maxGalleryFiles: "អាចបញ្ចូលរូបភាពបានអតិបរមា 8 រូប។",
    backStep: "ត្រឡប់",
    nextStep: "បន្ទាប់",
    submit: "រក្សាទុកសេវាកម្ម",
    success: "បានរក្សាទុកព្រាងសេវាកម្មដោយជោគជ័យ។",
    remove: "លុប",
  },
};

const MAX_GALLERY_FILES = 8;
const MAX_IMAGE_SIZE_MB = 4;

const DAYS = [
  { value: "MON", en: "Mon", km: "ចន្ទ" },
  { value: "TUE", en: "Tue", km: "អង្គារ" },
  { value: "WED", en: "Wed", km: "ពុធ" },
  { value: "THU", en: "Thu", km: "ព្រហស្បតិ៍" },
  { value: "FRI", en: "Fri", km: "សុក្រ" },
  { value: "SAT", en: "Sat", km: "សៅរ៍" },
  { value: "SUN", en: "Sun", km: "អាទិត្យ" },
];

function isPositiveNumber(value) {
  return Number(value) > 0;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

function buildGoogleMapUrls({ city = "", address = "" }) {
  const mapQuery = [address, city].filter(Boolean).join(", ").trim() || "Phnom Penh";
  return {
    query: mapQuery,
    viewUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`,
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`,
  };
}

export default function UploadServicePage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduleType, setScheduleType] = useState("FLEXIBLE");
  const [workingDays, setWorkingDays] = useState(["MON", "TUE", "WED", "THU", "FRI"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState("60");
  const [capacity, setCapacity] = useState("1");

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [prices, setPrices] = useState([
    { id: crypto.randomUUID(), name: "", amount: "", billingUnit: "HOUR", isDefault: true },
  ]);
  const [galleryItems, setGalleryItems] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const steps = useMemo(
    () => [
      { label: text.stepSummary, icon: FileText },
      { label: text.stepAvailability, icon: CalendarClock },
      { label: text.stepLocation, icon: MapPin },
      { label: text.stepPrice, icon: WalletCards },
      { label: text.stepGallery, icon: Images },
    ],
    [text.stepAvailability, text.stepGallery, text.stepLocation, text.stepPrice, text.stepSummary],
  );

  const safeTitle = String(title || "").trim();
  const safeDescription = String(description || "").trim();
  const safeCity = String(city || "").trim();
  const safeAddress = String(address || "").trim();
  const hasValidFixedHours = scheduleType !== "FIXED" || (startTime && endTime && startTime < endTime);
  const hasBaseAvailability = Boolean(workingDays.length) && isPositiveNumber(slotDuration) && isPositiveNumber(capacity);
  const { query: mapQuery, viewUrl: googleMapViewUrl, embedUrl: googleMapEmbedUrl } = useMemo(
    () => buildGoogleMapUrls({ city: safeCity, address: safeAddress }),
    [safeAddress, safeCity],
  );

  const hasValidPrice = prices.some((item) => {
    const optionName = String(item.name || "").trim();
    return optionName && isPositiveNumber(item.amount);
  });

  const hasInvalidPriceRow = prices.some((item) => {
    const optionName = String(item.name || "").trim();
    const optionAmount = String(item.amount || "").trim();
    if (!optionName && !optionAmount) return false;
    return !optionName || !isPositiveNumber(optionAmount);
  });

  const isSummaryComplete = Boolean(safeTitle && safeDescription);
  const isAvailabilityComplete = hasBaseAvailability && hasValidFixedHours;
  const isLocationComplete = Boolean(safeCity && safeAddress);
  const isPriceComplete = hasValidPrice && !hasInvalidPriceRow;
  const isGalleryComplete = galleryItems.length > 0;

  const completionStates = [
    isSummaryComplete,
    isAvailabilityComplete,
    isLocationComplete,
    isPriceComplete,
    isGalleryComplete,
  ];

  const completedStepCount = completionStates.filter(Boolean).length;
  const completionRate = Math.round((completedStepCount / steps.length) * 100);

  const toggleWorkingDay = (dayValue) => {
    setWorkingDays((prev) =>
      prev.includes(dayValue) ? prev.filter((item) => item !== dayValue) : [...prev, dayValue],
    );
  };

  const updatePrice = (index, key, value) => {
    setPrices((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    );
  };

  const addPriceOption = () => {
    setPrices((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", amount: "", billingUnit: "HOUR", isDefault: false },
    ]);
  };

  const removePriceOption = (index) => {
    setPrices((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      if (!next.some((item) => item.isDefault) && next[0]) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  };

  const setDefaultPrice = (index) => {
    setPrices((prev) => prev.map((item, itemIndex) => ({ ...item, isDefault: itemIndex === index })));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!isSummaryComplete) {
        setError(text.requiredSummary);
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!hasBaseAvailability) {
        setError(text.requiredAvailability);
        return false;
      }

      if (scheduleType === "FIXED") {
        if (!startTime || !endTime || !hasValidFixedHours) {
          setError(text.invalidWorkingHours);
          return false;
        }
      }
      return true;
    }

    if (currentStep === 3) {
      if (!safeCity || !safeAddress) {
        setError(text.requiredLocation);
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!hasValidPrice) {
        setError(text.requiredPrice);
        return false;
      }

      if (hasInvalidPriceRow) {
        setError(text.requiredPrice);
        return false;
      }
      return true;
    }

    if (currentStep === 5 && !isGalleryComplete) {
      setError(text.requiredGallery);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setSuccess("");
    if (!validateStep(step)) return;
    setError("");
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setSuccess("");
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGalleryUpload = async (event) => {
    const fileList = Array.from(event.target.files || []);
    if (!fileList.length) return;

    if (galleryItems.length >= MAX_GALLERY_FILES) {
      setError(text.maxGalleryFiles);
      event.target.value = "";
      return;
    }

    const availableSlots = MAX_GALLERY_FILES - galleryItems.length;
    const files = fileList.slice(0, availableSlots);

    const hasInvalidType = files.some((file) => !String(file.type || "").startsWith("image/"));
    if (hasInvalidType) {
      setError(text.invalidImageType);
      event.target.value = "";
      return;
    }

    const hasInvalidSize = files.some((file) => file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024);
    if (hasInvalidSize) {
      setError(text.invalidImageSize);
      event.target.value = "";
      return;
    }

    const prepared = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name || "image",
        dataUrl: await readFileAsDataUrl(file),
      })),
    );

    setGalleryItems((prev) => [...prev, ...prepared]);
    setError("");
    event.target.value = "";
  };

  const removeGalleryItem = (id) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const savePayload = () => {
    const safeTitle = String(title || "").trim();
    const safeDescription = String(description || "").trim();

    const mappedPrices = prices
      .map((item, index) => ({
        id: item.id,
        name: String(item.name || "").trim(),
        amount: Number(item.amount),
        currency: "USD",
        billingUnit: item.billingUnit || "HOUR",
        isDefault: Boolean(item.isDefault) || (!prices.some((entry) => entry.isDefault) && index === 0),
      }))
      .filter((item) => item.name && Number.isFinite(item.amount) && item.amount > 0);

    const payload = {
      title: safeTitle,
      description: safeDescription,
      availability: {
        scheduleType,
        workingDays,
        startTime: scheduleType === "FIXED" ? startTime : "",
        endTime: scheduleType === "FIXED" ? endTime : "",
        slotDuration: Number(slotDuration),
        capacity: Number(capacity),
      },
      location: {
        city: String(city || "").trim(),
        address: String(address || "").trim(),
        mapUrl: googleMapViewUrl,
      },
      priceOptions: mappedPrices,
      gallery: galleryItems.map((item, index) => ({
        id: item.id,
        name: item.name,
        dataUrl: item.dataUrl,
        sortOrder: index + 1,
      })),
    };

    setError("");
    setSuccess(text.success);
    sessionStorage.setItem("apsor:uploadServicePayload", JSON.stringify(payload));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess("");

    if (step < steps.length) {
      handleNext();
      return;
    }

    if (!validateStep(step)) return;

    savePayload();
  };

  const stepCardClassName =
    "rounded-2xl border border-border bg-linear-to-br from-bg-app/95 to-brand-soft/30 p-4 shadow-1 sm:p-5";

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-border bg-bg-surface/95 p-4 shadow-2 backdrop-blur sm:p-6 lg:p-7">
        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-linear-to-r from-brand-soft/65 via-bg-surface to-bg-subtle p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-linear-to-l from-brand/8 to-transparent" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-1">
                <Upload className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{text.title}</h1>
                <p className="text-sm text-text-secondary">{text.subtitle}</p>
              </div>
            </div>
            <div className="rounded-xl border border-brand/20 bg-bg-surface/90 px-3 py-2 text-right shadow-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                {`${text.stepLabel} ${step}/${steps.length}`}
              </p>
              <p className="text-sm font-semibold text-brand">{`${text.completionLabel}: ${completionRate}%`}</p>
            </div>
          </div>

          <div className="relative mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-text-muted">
              <span>{`${text.stepLabel} ${step}/${steps.length}`}</span>
              <span>{`${completionRate}%`}</span>
            </div>
            <div className="h-2 rounded-full bg-bg-surface/85">
              <div
                className="h-2 rounded-full bg-linear-to-r from-brand to-brand-hover transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <AuthStepProgress steps={steps} currentStep={step} className="mt-4" />

        <div className="mt-5">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {step === 1 ? (
              <div className={stepCardClassName}>
                <h2 className="text-sm font-semibold text-text-primary">{text.summaryTitle}</h2>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.serviceTitle}
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={text.serviceTitlePlaceholder}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.description}
                      </span>
                      <span className="text-[11px] text-text-muted">{`${safeDescription.length} chars`}</span>
                    </div>
                    <textarea
                      rows={7}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={text.descriptionPlaceholder}
                      className="w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className={stepCardClassName}>
                <h2 className="text-sm font-semibold text-text-primary">{text.availabilityTitle}</h2>

                <div className="mt-3 space-y-3">
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.scheduleType}
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setScheduleType("FLEXIBLE")}
                        className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                          scheduleType === "FLEXIBLE"
                            ? "border-brand/60 bg-brand-soft/60 text-brand shadow-1"
                            : "border-border bg-bg-surface text-text-secondary hover:border-brand/35"
                        }`}
                      >
                        {text.flexibleSchedule}
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleType("FIXED")}
                        className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                          scheduleType === "FIXED"
                            ? "border-brand/60 bg-brand-soft/60 text-brand shadow-1"
                            : "border-border bg-bg-surface text-text-secondary hover:border-brand/35"
                        }`}
                      >
                        {text.fixedHours}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.workingDays}
                    </span>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                      {DAYS.map((day) => {
                        const active = workingDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWorkingDay(day.value)}
                            className={`h-9 rounded-lg border text-xs font-semibold transition ${
                              active
                                ? "border-brand/60 bg-brand-soft/60 text-brand shadow-1"
                                : "border-border bg-bg-surface text-text-secondary hover:border-brand/35"
                            }`}
                          >
                            {lang === "km" ? day.km : day.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {scheduleType === "FIXED" ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                          {text.startTime}
                        </span>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(event) => setStartTime(event.target.value)}
                          className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                          {text.endTime}
                        </span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(event) => setEndTime(event.target.value)}
                          className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </label>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.slotDuration}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={slotDuration}
                        onChange={(event) => setSlotDuration(event.target.value)}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.capacityPerSlot}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={capacity}
                        onChange={(event) => setCapacity(event.target.value)}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className={stepCardClassName}>
                <h2 className="text-sm font-semibold text-text-primary">{text.locationTitle}</h2>

                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.city}
                    </span>
                    <input
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder={text.cityPlaceholder}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.address}
                    </span>
                    <textarea
                      rows={4}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder={text.addressPlaceholder}
                      className="w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>

                  <div className="rounded-xl border border-border bg-bg-surface p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.googleMap}
                      </span>
                      <a
                        href={googleMapViewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-brand hover:underline"
                      >
                        {text.previewMap}
                      </a>
                    </div>
                    <p className="text-xs text-text-muted">{text.googleMapHint}</p>

                    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-bg-subtle">
                      <iframe
                        title={`Google map for ${safeTitle || "service location"}`}
                        src={googleMapEmbedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-56 w-full border-0 sm:h-64"
                        allowFullScreen
                      />
                    </div>

                    <p className="mt-2 text-xs text-text-secondary">{mapQuery}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className={stepCardClassName}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-text-primary">{text.priceTitle}</h2>
                  <button
                    type="button"
                    onClick={addPriceOption}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/45 bg-brand-soft/40 px-3 text-xs font-semibold text-brand transition hover:border-brand"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {text.addOption}
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {prices.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-border bg-bg-surface p-3 shadow-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                          {`${text.optionName} ${index + 1}`}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.isDefault ? (
                            <span className="inline-flex h-7 items-center rounded-pill bg-brand px-2.5 text-[11px] font-semibold text-white">
                              {text.defaultOption}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDefaultPrice(index)}
                              className="inline-flex h-7 items-center rounded-pill border border-border px-2.5 text-[11px] font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
                            >
                              {text.setDefault}
                            </button>
                          )}
                          {prices.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePriceOption(index)}
                              className="inline-flex h-7 items-center gap-1 rounded-pill border border-danger/35 bg-danger/10 px-2.5 text-[11px] font-semibold text-danger transition hover:bg-danger/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {text.remove}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <label className="block sm:col-span-2">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.optionName}
                          </span>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(event) => updatePrice(index, "name", event.target.value)}
                            placeholder={text.optionNamePlaceholder}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.priceAmount}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(event) => updatePrice(index, "amount", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </label>
                      </div>

                      <label className="mt-2 block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                          {text.billingUnit}
                        </span>
                        <select
                          value={item.billingUnit}
                          onChange={(event) => updatePrice(index, "billingUnit", event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        >
                          {SERVICE_PRICE_BILLING_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {formatBillingUnit(unit, t)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className={stepCardClassName}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-text-primary">{text.galleryTitle}</h2>
                  <span className="inline-flex h-7 items-center rounded-pill border border-brand/30 bg-brand-soft/45 px-2.5 text-[11px] font-semibold text-brand">
                    {`${galleryItems.length}/${MAX_GALLERY_FILES}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{text.galleryHint}</p>

                <input
                  id="service-gallery-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />

                <label
                  htmlFor="service-gallery-upload"
                  className="mt-3 flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand/40 bg-brand-soft/25 text-center transition hover:border-brand hover:bg-brand-soft/35"
                >
                  <ImagePlus className="h-5 w-5 text-brand" />
                  <p className="mt-1 text-sm font-semibold text-brand">
                    {galleryItems.length ? text.addMoreImages : text.uploadImages}
                  </p>
                </label>

                {galleryItems.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border bg-bg-surface">
                        <img src={item.dataUrl} alt={item.name} className="h-24 w-full object-cover sm:h-28" />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(item.id)}
                          className="absolute right-1 top-1 inline-flex h-7 items-center gap-1 rounded-md border border-danger/35 bg-danger/85 px-2 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {text.remove}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-success/35 bg-success/10 px-3 py-2 text-sm text-success">
                {success}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 rounded-xl border border-border bg-bg-subtle/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
              >
                {text.backStep}
              </button>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
              >
                <Upload className="h-4 w-4" />
                {step === steps.length ? text.submit : text.nextStep}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
