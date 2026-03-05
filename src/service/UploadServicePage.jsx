import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  FileText,
  ImagePlus,
  Images,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import AuthStepProgress from "../components/auth/AuthStepProgress";
import Breadcrumb from "../components/shared/Breadcrumb";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";
import { useLang } from "../i18n/useLang";
import { formatBillingUnit, SERVICE_PRICE_BILLING_UNITS } from "../utils/pricing";

const SERVICE_PRICE_TYPES = Object.freeze(["TIME_BASED", "FIXED"]);
const SERVICE_PRICE_CURRENCIES = Object.freeze(["USD", "KHR"]);
const LOCATION_MODE_OPTIONS = Object.freeze(["ONSITE", "REMOTE"]);
const DEFAULT_MAP_CENTER = Object.freeze({ lat: 11.5564, lng: 104.9282 });
const GOOGLE_MAP_SCRIPT_ID = "apsor-google-map-sdk";

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
    locationMode: "Location mode",
    locationModeHint: "Choose where this service can be delivered.",
    locationModeOnsite: "On-site",
    locationModeRemote: "Remote",
    category: "Category",
    categoryPlaceholder: "Select category",
    subcategory: "Subcategory",
    subcategoryPlaceholder: "Select subcategory",
    subcategoryEmpty: "Select category first",
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
    mapLocation: "Use Google Map",
    line1: "Address line 1",
    line1Placeholder: "123 Sample Street",
    line1Help: "Main street address: house/building number and street.",
    line2: "Address line 2",
    line2Placeholder: "Apartment 456",
    line2Help: "Extra details like apartment, floor, landmark, or nearby place.",
    district: "District",
    districtPlaceholder: "Daun Penh",
    districtHelp: "Local district/khan area for this address.",
    city: "City",
    cityPlaceholder: "Phnom Penh",
    province: "Province",
    provincePlaceholder: "Phnom Penh",
    provinceHelp: "Province or capital city for this address.",
    postalCode: "Postal code",
    postalCodePlaceholder: "12000",
    countryCode: "Country code",
    countryCodePlaceholder: "KH",
    latitude: "Latitude",
    longitude: "Longitude",
    googleMap: "Google map",
    googleMapHint: "Map preview updates automatically from your address fields or coordinates.",
    googleMapLiveHint: "Drag the map under the center pin to update address details live.",
    googleMapLoading: "Loading interactive Google Map...",
    googleMapFallbackMissingKey:
      "Interactive map is disabled because Google Maps API key is missing. Showing preview mode.",
    googleMapFallbackUnavailable: "Interactive map failed to load. Showing preview mode.",
    mapSearch: "Map search",
    mapSearchPlaceholder: "Place name or full address",
    searchMap: "Search",
    clearMapSearch: "Clear",
    updatingAddress: "Updating address...",
    selectedLocation: "Selected location",
    coordinates: "Coordinates",
    country: "Country",
    getFromMap: "Get from map",
    gettingFromMap: "Getting from map...",
    useDeviceLocation: "Use device location",
    gettingDeviceLocation: "Getting device location...",
    geolocationNotSupported: "Geolocation is not supported on this device/browser.",
    geolocationPermissionDenied: "Location permission denied. Please allow location access.",
    geolocationFailed: "Unable to get location from device. Please try again.",
    mapLookupFailed: "Unable to get country and coordinates from map. Please check address and try again.",
    priceTitle: "Price options",
    optionName: "Option name",
    optionNamePlaceholder: "Standard package",
    priceType: "Price type",
    timeBased: "Time based",
    fixedPrice: "Fixed",
    priceAmount: "Amount (USD)",
    billingUnit: "Billing unit",
    currency: "Currency",
    minUnits: "Min units",
    maxUnits: "Max units",
    defaultOption: "Default",
    setDefault: "Set default",
    addOption: "Add price option",
    galleryTitle: "Service gallery",
    galleryHint: "Upload service photos to increase trust. JPG, PNG, WEBP up to 10MB each.",
    uploadImages: "Upload images",
    addMoreImages: "Add more images",
    previewMap: "Preview map",
    stepLabel: "Step",
    completionLabel: "Completion",
    requiredSummary: "Please complete category, subcategory, service title, and description.",
    requiredAvailability: "Please complete availability details.",
    invalidWorkingHours: "End time must be later than start time.",
    requiredLocationMap: "Please select a location on map or set coordinates.",
    requiredPrice: "Please provide at least one valid price option.",
    requiredGallery: "Please upload at least one gallery image.",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Each image must be 10MB or less.",
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
    stepGallery: "រូបភាព",
    summaryTitle: "សេចក្តីសង្ខេបសេវាកម្ម",
    locationMode: "របៀបទីតាំងសេវា",
    locationModeHint: "ជ្រើសកន្លែងដែលសេវាកម្មនេះអាចផ្តល់បាន។",
    locationModeOnsite: "ទៅកាន់ទីតាំង",
    locationModeRemote: "ពីចម្ងាយ",
    category: "ប្រភេទ",
    categoryPlaceholder: "ជ្រើសរើសប្រភេទ",
    subcategory: "ប្រភេទរង",
    subcategoryPlaceholder: "ជ្រើសរើសប្រភេទរង",
    subcategoryEmpty: "សូមជ្រើសរើសប្រភេទជាមុន",
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
    mapLocation: "ប្រើ Google Map",
    line1: "អាសយដ្ឋាន បន្ទាត់ទី១",
    line1Placeholder: "123 Sample Street",
    line1Help: "អាសយដ្ឋានសំខាន់៖ លេខផ្ទះ/អគារ និងផ្លូវ។",
    line2: "អាសយដ្ឋាន បន្ទាត់ទី២",
    line2Placeholder: "Apartment 456",
    line2Help: "ព័ត៌មានបន្ថែម ដូចជា អគារ ជាន់ សញ្ញាសម្គាល់ ឬ កន្លែងជិតខាង។",
    district: "ខណ្ឌ",
    districtPlaceholder: "ដូនពេញ",
    districtHelp: "ខណ្ឌ/ស្រុកក្នុងតំបន់របស់អាសយដ្ឋាននេះ។",
    city: "ទីក្រុង",
    cityPlaceholder: "ភ្នំពេញ",
    province: "ខេត្ត/រាជធានី",
    provincePlaceholder: "ភ្នំពេញ",
    provinceHelp: "ខេត្ត ឬ រាជធានីរបស់អាសយដ្ឋាននេះ។",
    postalCode: "លេខកូដប្រៃសណីយ៍",
    postalCodePlaceholder: "12000",
    countryCode: "កូដប្រទេស",
    countryCodePlaceholder: "KH",
    latitude: "រយៈទទឹង",
    longitude: "រយៈបណ្តោយ",
    googleMap: "ផែនទី Google",
    googleMapHint: "ផែនទីនឹងបង្ហាញដោយស្វ័យប្រវត្តិ ពីអាសយដ្ឋាន ឬ កូអរដោណេ។",
    googleMapLiveHint: "អូសផែនទីក្រោមសញ្ញាកណ្តាល ដើម្បីធ្វើបច្ចុប្បន្នភាពអាសយដ្ឋានជាបន្តផ្ទាល់។",
    googleMapLoading: "កំពុងផ្ទុកផែនទី Google អន្តរកម្ម...",
    googleMapFallbackMissingKey:
      "ផែនទីអន្តរកម្មត្រូវបានបិទ ព្រោះមិនមាន Google Maps API key។ កំពុងប្រើរបៀបមើលជាមុន។",
    googleMapFallbackUnavailable: "មិនអាចផ្ទុកផែនទីអន្តរកម្មបាន។ កំពុងប្រើរបៀបមើលជាមុន។",
    mapSearch: "ស្វែងរកលើផែនទី",
    mapSearchPlaceholder: "ឈ្មោះទីតាំង ឬ អាសយដ្ឋានពេញ",
    searchMap: "ស្វែងរក",
    clearMapSearch: "សម្អាត",
    updatingAddress: "កំពុងធ្វើបច្ចុប្បន្នភាពអាសយដ្ឋាន...",
    selectedLocation: "ទីតាំងដែលបានជ្រើស",
    coordinates: "កូអរដោណេ",
    country: "ប្រទេស",
    getFromMap: "យកពីផែនទី",
    gettingFromMap: "កំពុងយកពីផែនទី...",
    useDeviceLocation: "ប្រើទីតាំងឧបករណ៍",
    gettingDeviceLocation: "កំពុងយកទីតាំងពីឧបករណ៍...",
    geolocationNotSupported: "ឧបករណ៍/កម្មវិធីរុករកនេះមិនគាំទ្រ geolocation ទេ។",
    geolocationPermissionDenied: "បានបដិសេធការអនុញ្ញាតទីតាំង។ សូមអនុញ្ញាត location access។",
    geolocationFailed: "មិនអាចយកទីតាំងពីឧបករណ៍បានទេ។ សូមសាកល្បងម្ដងទៀត។",
    mapLookupFailed: "មិនអាចទាញយកកូដប្រទេស និងកូអរដោណេពីផែនទីបានទេ។ សូមពិនិត្យអាសយដ្ឋាន ហើយសាកល្បងម្ដងទៀត។",
    priceTitle: "ជម្រើសតម្លៃ",
    optionName: "ឈ្មោះជម្រើស",
    optionNamePlaceholder: "កញ្ចប់ស្តង់ដារ",
    priceType: "ប្រភេទតម្លៃ",
    timeBased: "គិតតាមពេលវេលា",
    fixedPrice: "តម្លៃថេរ",
    priceAmount: "តម្លៃ (USD)",
    billingUnit: "ឯកតាគិតតម្លៃ",
    currency: "រូបិយប័ណ្ណ",
    minUnits: "ចំនួនអប្បបរមា",
    maxUnits: "ចំនួនអតិបរមា",
    defaultOption: "លំនាំដើម",
    setDefault: "កំណត់ជាលំនាំដើម",
    addOption: "បន្ថែមជម្រើសតម្លៃ",
    galleryTitle: "វិចិត្រសាលសេវាកម្ម",
    galleryHint: "បញ្ចូលរូបភាពសេវាកម្មដើម្បីបង្កើនការទុកចិត្ត។ JPG, PNG, WEBP ទំហំតិចជាង 10MB។",
    uploadImages: "បញ្ចូលរូបភាព",
    addMoreImages: "បន្ថែមរូបភាព",
    previewMap: "មើលផែនទី",
    stepLabel: "ជំហាន",
    completionLabel: "ការបំពេញ",
    requiredSummary: "សូមបំពេញប្រភេទ ប្រភេទរង ចំណងជើងសេវាកម្ម និងពិពណ៌នា។",
    requiredAvailability: "សូមបំពេញព័ត៌មានពេលវេលាផ្តល់សេវា។",
    invalidWorkingHours: "ម៉ោងបញ្ចប់ត្រូវតែធំជាងម៉ោងចាប់ផ្តើម។",
    requiredLocationMap: "សូមជ្រើសទីតាំងលើផែនទី ឬ កំណត់កូអរដោណេ។",
    requiredPrice: "សូមបញ្ចូលជម្រើសតម្លៃត្រឹមត្រូវយ៉ាងហោចណាស់ ១។",
    requiredGallery: "សូមបញ្ចូលរូបភាពវិចិត្រសាលយ៉ាងហោចណាស់ ១។",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "រូបភាពនីមួយៗត្រូវតិចជាង ឬស្មើ 10MB។",
    maxGalleryFiles: "អាចបញ្ចូលរូបភាពបានអតិបរមា 8 រូប។",
    backStep: "ត្រឡប់",
    nextStep: "បន្ទាប់",
    submit: "រក្សាទុកសេវាកម្ម",
    success: "បានរក្សាទុកព្រាងសេវាកម្មដោយជោគជ័យ។",
    remove: "លុប",
  },
};

const MAX_GALLERY_FILES = 8;
const MAX_IMAGE_SIZE_MB = 10;

const DAYS = [
  { value: "MON", en: "Mon", km: "ចន្ទ" },
  { value: "TUE", en: "Tue", km: "អង្គារ" },
  { value: "WED", en: "Wed", km: "ពុធ" },
  { value: "THU", en: "Thu", km: "ព្រហស្បតិ៍" },
  { value: "FRI", en: "Fri", km: "សុក្រ" },
  { value: "SAT", en: "Sat", km: "សៅរ៍" },
  { value: "SUN", en: "Sun", km: "អាទិត្យ" },
];

const OPEN_DAY_BIT = {
  MON: 1 << 0,
  TUE: 1 << 1,
  WED: 1 << 2,
  THU: 1 << 3,
  FRI: 1 << 4,
  SAT: 1 << 5,
  SUN: 1 << 6,
};

function pickLang(value, lang) {
  if (!value || typeof value !== "object") return String(value || "");
  return value[lang] || value.en || value.km || "";
}

function isPositiveNumber(value) {
  return Number(value) > 0;
}

function buildOpenDaysMask(days) {
  return (Array.isArray(days) ? days : []).reduce((mask, day) => {
    const bit = OPEN_DAY_BIT[day];
    return mask | (bit || 0);
  }, 0);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

function parseOptionalNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseCoordinateQuery(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

function loadGoogleMapsSdk(apiKey) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window not available"));
  }

  const safeApiKey = String(apiKey || "").trim();
  if (!safeApiKey) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }

  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps);
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps API unavailable"));
      }
    };

    const existingScript = document.getElementById(GOOGLE_MAP_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", onReady, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAP_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(safeApiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.appendChild(script);
  });
}

function pickFirstText(...values) {
  for (const value of values) {
    const safe = String(value || "").trim();
    if (safe) return safe;
  }
  return "";
}

function buildLine1FromMapAddress(address = {}) {
  const houseNumber = String(address?.house_number || "").trim();
  const road = pickFirstText(address?.road, address?.pedestrian, address?.residential, address?.footway);
  const combo = [houseNumber, road].filter(Boolean).join(" ").trim();
  return combo || pickFirstText(address?.building, address?.amenity, address?.neighbourhood);
}

function buildAddressQuery({ line1 = "", line2 = "", district = "", city = "", province = "", postalCode = "" }) {
  return [line1, line2, district, city, province, postalCode].filter(Boolean).join(", ").trim();
}

function buildGoogleMapUrls({
  searchQuery = "",
  line1 = "",
  line2 = "",
  district = "",
  city = "",
  province = "",
  postalCode = "",
  latitude = null,
  longitude = null,
}) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const safeSearchQuery = String(searchQuery || "").trim();
  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : safeSearchQuery ||
      [line1, line2, district, city, province, postalCode].filter(Boolean).join(", ").trim() ||
      "Phnom Penh";
  return {
    query: mapQuery,
    viewUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`,
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`,
  };
}

function createPriceOption({ isDefault = false } = {}) {
  return {
    id: crypto.randomUUID(),
    name: "",
    priceType: "TIME_BASED",
    billingUnit: "DAY",
    amount: "",
    currency: "USD",
    isDefault,
    minUnits: "1",
    maxUnits: "90",
  };
}

export default function UploadServicePage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [locationModes, setLocationModes] = useState(["ONSITE", "REMOTE"]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduleType, setScheduleType] = useState("FLEXIBLE");
  const [workingDays, setWorkingDays] = useState(["MON", "TUE", "WED", "THU", "FRI"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState("60");
  const [capacity, setCapacity] = useState("1");

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [mapSearch, setMapSearch] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [prices, setPrices] = useState([createPriceOption({ isDefault: true })]);
  const [galleryItems, setGalleryItems] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResolvingMap, setIsResolvingMap] = useState(false);
  const [isResolvingDeviceLocation, setIsResolvingDeviceLocation] = useState(false);
  const [isAutoSyncingAddress, setIsAutoSyncingAddress] = useState(false);
  const lastResolvedCoordinateKeyRef = useRef("");
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapIdleListenerRef = useRef(null);
  const latestCoordinateRef = useRef({
    hasCoordinatePair: false,
    latitude: DEFAULT_MAP_CENTER.lat,
    longitude: DEFAULT_MAP_CENTER.lng,
  });
  const lastMapCenterCoordinateKeyRef = useRef("");
  const [isGoogleMapReady, setIsGoogleMapReady] = useState(false);
  const [hasGoogleMapLoadError, setHasGoogleMapLoadError] = useState(false);
  const googleMapApiKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();

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
  const selectedCategory = useMemo(
    () => DEFAULT_CATEGORIES.find((item) => item.id === categoryId) || null,
    [categoryId],
  );
  const availableSubcategories = useMemo(
    () => DEFAULT_SUBCATEGORIES.filter((item) => item.categoryId === categoryId),
    [categoryId],
  );
  const selectedSubcategory = useMemo(
    () => availableSubcategories.find((item) => item.id === subcategoryId) || null,
    [availableSubcategories, subcategoryId],
  );
  const normalizedLocationModes = useMemo(
    () =>
      Array.from(
        new Set(
          (Array.isArray(locationModes) ? locationModes : [])
            .map((mode) => String(mode || "").trim().toUpperCase())
            .filter((mode) => LOCATION_MODE_OPTIONS.includes(mode)),
        ),
      ),
    [locationModes],
  );
  const safeLocationMode = normalizedLocationModes.join(",");
  const requiresOnsiteLocation = normalizedLocationModes.includes("ONSITE");
  const hasValidCategorySelection = Boolean(selectedCategory);
  const hasValidSubcategorySelection = Boolean(selectedSubcategory);
  const safeLine1 = String(line1 || "").trim();
  const safeLine2 = String(line2 || "").trim();
  const safeDistrict = String(district || "").trim();
  const safeCity = String(city || "").trim();
  const safeProvince = String(province || "").trim();
  const safePostalCode = String(postalCode || "").trim();
  const safeMapSearch = String(mapSearch || "").trim();
  const safeCountryCode = String(countryCode || "").trim().toUpperCase();
  const parsedLatitude = parseOptionalNumber(latitude);
  const parsedLongitude = parseOptionalNumber(longitude);
  const hasCoordinatePair = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const safeLatitude = hasCoordinatePair ? parsedLatitude : null;
  const safeLongitude = hasCoordinatePair ? parsedLongitude : null;
  const addressMapQuery = useMemo(
    () =>
      buildAddressQuery({
        line1: safeLine1,
        line2: safeLine2,
        district: safeDistrict,
        city: safeCity,
        province: safeProvince,
        postalCode: safePostalCode,
      }),
    [safeLine1, safeLine2, safeDistrict, safeCity, safeProvince, safePostalCode],
  );
  const selectedLocationText = useMemo(
    () =>
      [safeLine1, safeLine2, safeDistrict, safeCity, safeProvince, safePostalCode]
        .filter(Boolean)
        .join(", "),
    [safeLine1, safeLine2, safeDistrict, safeCity, safeProvince, safePostalCode],
  );
  const coordinatesText = hasCoordinatePair
    ? `${safeLatitude.toFixed(6)}, ${safeLongitude.toFixed(6)}`
    : "-";
  const hasValidFixedHours = scheduleType !== "FIXED" || (startTime && endTime && startTime < endTime);
  const hasBaseAvailability = Boolean(workingDays.length) && isPositiveNumber(slotDuration) && isPositiveNumber(capacity);
  const { query: mapQuery, viewUrl: googleMapViewUrl, embedUrl: googleMapEmbedUrl } = useMemo(
    () =>
      buildGoogleMapUrls({
        searchQuery: safeMapSearch,
        line1: safeLine1,
        line2: safeLine2,
        district: safeDistrict,
        city: safeCity,
        province: safeProvince,
        postalCode: safePostalCode,
        latitude: safeLatitude,
        longitude: safeLongitude,
      }),
    [
      safeMapSearch,
      safeLine1,
      safeLine2,
      safeDistrict,
      safeCity,
      safeProvince,
      safePostalCode,
      safeLatitude,
      safeLongitude,
    ],
  );
  const canUseInteractiveGoogleMap =
    Boolean(googleMapApiKey) && isGoogleMapReady && !hasGoogleMapLoadError;
  const mapStatusHint = canUseInteractiveGoogleMap
    ? text.googleMapLiveHint
    : !googleMapApiKey
      ? text.googleMapFallbackMissingKey
      : hasGoogleMapLoadError
        ? text.googleMapFallbackUnavailable
        : text.googleMapLoading;

  useEffect(() => {
    latestCoordinateRef.current = {
      hasCoordinatePair,
      latitude: hasCoordinatePair ? safeLatitude : DEFAULT_MAP_CENTER.lat,
      longitude: hasCoordinatePair ? safeLongitude : DEFAULT_MAP_CENTER.lng,
    };
  }, [hasCoordinatePair, safeLatitude, safeLongitude]);

  useEffect(() => {
    if (!googleMapApiKey) {
      setIsGoogleMapReady(false);
      setHasGoogleMapLoadError(false);
      return undefined;
    }

    let active = true;
    setHasGoogleMapLoadError(false);

    loadGoogleMapsSdk(googleMapApiKey)
      .then(() => {
        if (!active) return;
        setIsGoogleMapReady(true);
      })
      .catch(() => {
        if (!active) return;
        setIsGoogleMapReady(false);
        setHasGoogleMapLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [googleMapApiKey]);

  useEffect(() => {
    if (step !== 3 || !isGoogleMapReady || hasGoogleMapLoadError) return undefined;
    if (!mapContainerRef.current || !window.google?.maps?.Map) return undefined;
    if (mapInstanceRef.current) return undefined;

    const initialCoordinates = latestCoordinateRef.current;
    const initialCenter = initialCoordinates.hasCoordinatePair
      ? { lat: initialCoordinates.latitude, lng: initialCoordinates.longitude }
      : DEFAULT_MAP_CENTER;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialCoordinates.hasCoordinatePair ? 18 : 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: "greedy",
    });

    mapInstanceRef.current = map;
    lastMapCenterCoordinateKeyRef.current = `${initialCenter.lat.toFixed(6)},${initialCenter.lng.toFixed(6)}`;

    mapIdleListenerRef.current = map.addListener("idle", () => {
      const center = map.getCenter();
      if (!center) return;

      const nextLatitude = Number(center.lat().toFixed(6));
      const nextLongitude = Number(center.lng().toFixed(6));
      if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) return;

      const nextCoordinateKey = `${nextLatitude.toFixed(6)},${nextLongitude.toFixed(6)}`;
      if (lastMapCenterCoordinateKeyRef.current === nextCoordinateKey) return;

      lastMapCenterCoordinateKeyRef.current = nextCoordinateKey;
      setLatitude(String(nextLatitude));
      setLongitude(String(nextLongitude));
      setMapSearch(`${nextLatitude.toFixed(6)}, ${nextLongitude.toFixed(6)}`);
      setError("");
    });

    return () => {
      if (mapIdleListenerRef.current) {
        mapIdleListenerRef.current.remove();
        mapIdleListenerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [step, isGoogleMapReady, hasGoogleMapLoadError]);

  useEffect(() => {
    if (step !== 3 || !canUseInteractiveGoogleMap || !hasCoordinatePair) return;

    const map = mapInstanceRef.current;
    if (!map) return;

    const center = map.getCenter();
    if (!center) return;

    const latDiff = Math.abs(center.lat() - safeLatitude);
    const lonDiff = Math.abs(center.lng() - safeLongitude);
    if (latDiff < 0.000001 && lonDiff < 0.000001) return;

    const nextCoordinateKey = `${safeLatitude.toFixed(6)},${safeLongitude.toFixed(6)}`;
    lastMapCenterCoordinateKeyRef.current = nextCoordinateKey;
    map.panTo({ lat: safeLatitude, lng: safeLongitude });
  }, [step, canUseInteractiveGoogleMap, hasCoordinatePair, safeLatitude, safeLongitude]);

  const hasValidPrice = prices.some((item) => {
    const optionName = String(item.name || "").trim();
    const optionAmount = Number(item.amount);
    const optionMinUnits = Number(item.minUnits);
    const optionMaxUnits = Number(item.maxUnits);
    const optionCurrency = String(item.currency || "").trim().toUpperCase();
    return (
      optionName &&
      Number.isFinite(optionAmount) &&
      optionAmount > 0 &&
      SERVICE_PRICE_TYPES.includes(item.priceType) &&
      Boolean(item.billingUnit) &&
      SERVICE_PRICE_CURRENCIES.includes(optionCurrency) &&
      Number.isInteger(optionMinUnits) &&
      optionMinUnits > 0 &&
      Number.isInteger(optionMaxUnits) &&
      optionMaxUnits >= optionMinUnits
    );
  });

  const hasInvalidPriceRow = prices.some((item) => {
    const optionName = String(item.name || "").trim();
    const optionAmountText = String(item.amount || "").trim();
    const isBlank = !optionName && !optionAmountText;
    if (isBlank) return false;

    const optionAmount = Number(item.amount);
    const optionMinUnits = Number(item.minUnits);
    const optionMaxUnits = Number(item.maxUnits);
    const optionCurrency = String(item.currency || "").trim().toUpperCase();

    return (
      !optionName ||
      !Number.isFinite(optionAmount) ||
      optionAmount <= 0 ||
      !SERVICE_PRICE_TYPES.includes(item.priceType) ||
      !item.billingUnit ||
      !SERVICE_PRICE_CURRENCIES.includes(optionCurrency) ||
      !Number.isInteger(optionMinUnits) ||
      optionMinUnits <= 0 ||
      !Number.isInteger(optionMaxUnits) ||
      optionMaxUnits < optionMinUnits
    );
  });

  const isSummaryComplete = Boolean(
    hasValidCategorySelection && hasValidSubcategorySelection && safeTitle && safeDescription,
  );
  const isAvailabilityComplete = hasBaseAvailability && hasValidFixedHours;
  const isMapLocationComplete = !requiresOnsiteLocation || Boolean(hasCoordinatePair);
  const isLocationComplete = isMapLocationComplete;
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

  const toggleLocationMode = (modeValue) => {
    const normalizedMode = String(modeValue || "").trim().toUpperCase();
    if (!LOCATION_MODE_OPTIONS.includes(normalizedMode)) return;

    setLocationModes((prev) => {
      const currentModes = Array.isArray(prev)
        ? prev.map((mode) => String(mode || "").trim().toUpperCase()).filter(Boolean)
        : [];
      const hasMode = currentModes.includes(normalizedMode);

      if (hasMode) {
        if (currentModes.length <= 1) return currentModes;
        return currentModes.filter((mode) => mode !== normalizedMode);
      }

      return [...currentModes, normalizedMode];
    });
  };

  const updatePrice = (index, key, value) => {
    setPrices((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    );
  };

  const addPriceOption = () => {
    setPrices((prev) => [...prev, createPriceOption({ isDefault: false })]);
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
      if (!isMapLocationComplete) {
        setError(text.requiredLocationMap);
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

  const handleNext = async () => {
    setSuccess("");

    if (step === 3 && isResolvingDeviceLocation) {
      setError(text.gettingDeviceLocation);
      return;
    }

    if (step === 3 && !isMapLocationComplete) {
      const resolved = await handleResolveFromMap();
      if (!resolved) return;
      setError("");
      setStep((prev) => Math.min(prev + 1, steps.length));
      return;
    }

    if (!validateStep(step)) return;
    setError("");
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setSuccess("");
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMapSearchSubmit = async (event) => {
    event.preventDefault();
    const query = String(mapSearch || "").trim();
    if (!query) {
      setError(text.requiredLocationMap);
      return;
    }
    await handleResolveFromMap(query);
  };

  const handleClearMapSearch = () => {
    setMapSearch("");
    setError("");
  };

  const handleResolveFromMap = async (lookupQueryOverride = "") => {
    setSuccess("");

    const coordinateQuery = hasCoordinatePair ? `${safeLatitude},${safeLongitude}` : "";
    const lookupQuery = String(
      lookupQueryOverride
      || safeMapSearch
      || addressMapQuery
      || coordinateQuery
      || mapQuery,
    ).trim();
    if (!lookupQuery) {
      setError(text.requiredLocationMap);
      return false;
    }

    setIsResolvingMap(true);
    setError("");

    try {
      const directCoordinates = parseCoordinateQuery(lookupQuery);
      let item = null;

      if (directCoordinates) {
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(directCoordinates.latitude)}&lon=${encodeURIComponent(directCoordinates.longitude)}&accept-language=${encodeURIComponent(lang === "km" ? "km,en" : "en")}`,
        );

        if (reverseResponse.ok) {
          item = await reverseResponse.json();
        }

        if (!item) {
          item = {
            lat: directCoordinates.latitude,
            lon: directCoordinates.longitude,
            address: {},
            display_name: lookupQuery,
          };
        }
      } else {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(lookupQuery)}&accept-language=${encodeURIComponent(lang === "km" ? "km,en" : "en")}`,
        );

        if (!response.ok) {
          throw new Error("Map lookup failed");
        }

        const results = await response.json();
        item = Array.isArray(results) ? results[0] : null;
      }

      if (!item) {
        throw new Error("Map lookup missing result");
      }

      const address = item?.address || {};
      const displayParts = String(item?.display_name || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      const nextLatitude = directCoordinates
        ? directCoordinates.latitude
        : parseOptionalNumber(item?.lat);
      const nextLongitude = directCoordinates
        ? directCoordinates.longitude
        : parseOptionalNumber(item?.lon);
      const nextCountryCode = String(address?.country_code || safeCountryCode || "")
        .trim()
        .toUpperCase();
      const nextLine1 = pickFirstText(
        buildLine1FromMapAddress(address),
        displayParts[0],
        safeLine1,
        lookupQuery,
      );
      const nextLine2 = pickFirstText(
        address?.suburb,
        address?.city_district,
        address?.neighbourhood,
        address?.quarter,
        address?.village,
        safeLine2,
      );
      const nextDistrict = pickFirstText(
        address?.city_district,
        address?.suburb,
        address?.county,
        address?.borough,
        safeDistrict,
      );
      const nextCity = pickFirstText(
        address?.city,
        address?.town,
        address?.municipality,
        address?.village,
        address?.county,
        address?.state_district,
        safeCity,
        displayParts[1],
      );
      const nextProvince = pickFirstText(
        address?.state,
        address?.province,
        address?.region,
        address?.county,
        address?.state_district,
        safeProvince,
        nextCity,
        displayParts[2],
      );
      const nextPostalCode = String(address?.postcode || safePostalCode || "").trim();

      if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
        throw new Error("Map lookup missing coordinates");
      }

      setLine1(nextLine1);
      setLine2(nextLine2);
      setDistrict(nextDistrict);
      setCity(nextCity || nextProvince);
      setProvince(nextProvince || nextCity);
      setPostalCode(nextPostalCode);
      setLatitude(String(nextLatitude));
      setLongitude(String(nextLongitude));
      setCountryCode(nextCountryCode);
      setMapSearch(String(item?.display_name || lookupQuery).trim());
      lastResolvedCoordinateKeyRef.current = `${Number(nextLatitude).toFixed(6)},${Number(nextLongitude).toFixed(6)}`;
      setError("");
      return true;
    } catch {
      setError(text.mapLookupFailed);
      return false;
    } finally {
      setIsResolvingMap(false);
    }
  };

  useEffect(() => {
    if (!hasCoordinatePair) return undefined;
    if (isResolvingMap || isResolvingDeviceLocation) return undefined;

    const coordinateKey = `${parsedLatitude.toFixed(6)},${parsedLongitude.toFixed(6)}`;
    if (lastResolvedCoordinateKeyRef.current === coordinateKey) return undefined;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsAutoSyncingAddress(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(parsedLatitude)}&lon=${encodeURIComponent(parsedLongitude)}&accept-language=${encodeURIComponent(lang === "km" ? "km,en" : "en")}`,
          { signal: controller.signal },
        );

        if (!response.ok) return;

        const item = await response.json();
        const address = item?.address || {};
        const displayParts = String(item?.display_name || "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);

        const nextLine1 = pickFirstText(
          buildLine1FromMapAddress(address),
          displayParts[0],
          `${parsedLatitude.toFixed(6)}, ${parsedLongitude.toFixed(6)}`,
        );
        const nextLine2 = pickFirstText(
          address?.suburb,
          address?.city_district,
          address?.neighbourhood,
          address?.quarter,
          address?.village,
        );
        const nextDistrict = pickFirstText(
          address?.city_district,
          address?.suburb,
          address?.county,
          address?.borough,
        );
        const nextCity = pickFirstText(
          address?.city,
          address?.town,
          address?.municipality,
          address?.village,
          address?.county,
          address?.state_district,
          displayParts[1],
        );
        const nextProvince = pickFirstText(
          address?.state,
          address?.province,
          address?.region,
          address?.county,
          address?.state_district,
          nextCity,
          displayParts[2],
        );
        const nextPostalCode = String(address?.postcode || "").trim();
        const nextCountryCode = String(address?.country_code || "")
          .trim()
          .toUpperCase();

        setLine1(nextLine1);
        setLine2(nextLine2);
        setDistrict(nextDistrict);
        setCity(nextCity || nextProvince);
        setProvince(nextProvince || nextCity);
        setPostalCode(nextPostalCode);
        setCountryCode(nextCountryCode || safeCountryCode);
        setMapSearch(String(item?.display_name || coordinateKey).trim());
        lastResolvedCoordinateKeyRef.current = coordinateKey;
      } catch (err) {
        if (err?.name === "AbortError") return;
      } finally {
        setIsAutoSyncingAddress(false);
      }
    }, 420);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    hasCoordinatePair,
    isResolvingMap,
    isResolvingDeviceLocation,
    parsedLatitude,
    parsedLongitude,
    lang,
    safeCountryCode,
  ]);

  const handleUseDeviceLocation = () => {
    setSuccess("");

    if (!navigator.geolocation) {
      setError(text.geolocationNotSupported);
      return;
    }

    setIsResolvingDeviceLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const nextLatitude = parseOptionalNumber(position?.coords?.latitude);
          const nextLongitude = parseOptionalNumber(position?.coords?.longitude);

          if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
            throw new Error("Invalid device coordinates");
          }

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(nextLatitude)}&lon=${encodeURIComponent(nextLongitude)}`,
          );

          if (!response.ok) {
            throw new Error("Reverse geocode failed");
          }

          const item = await response.json();
          const address = item?.address || {};
          const displayParts = String(item?.display_name || "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
          const nextCountryCode = String(address?.country_code || "")
            .trim()
            .toUpperCase();
          const nextLine1 = pickFirstText(
            buildLine1FromMapAddress(address),
            displayParts[0],
            safeLine1,
            `${nextLatitude}, ${nextLongitude}`,
          );
          const nextLine2 = pickFirstText(
            address?.suburb,
            address?.city_district,
            address?.neighbourhood,
            address?.quarter,
            address?.village,
            safeLine2,
          );
          const nextDistrict = pickFirstText(address?.city_district, address?.suburb, address?.county, address?.borough);
          const nextCity = pickFirstText(
            address?.city,
            address?.town,
            address?.municipality,
            address?.village,
            address?.county,
            address?.state_district,
            safeCity,
            displayParts[1],
          );
          const nextProvince = pickFirstText(
            address?.state,
            address?.province,
            address?.region,
            address?.county,
            address?.state_district,
            safeProvince,
            nextCity,
            displayParts[2],
          );
          const nextPostalCode = String(address?.postcode || safePostalCode || "").trim();

          setLine1(nextLine1);
          setLine2(nextLine2);
          setDistrict(nextDistrict);
          setCity(nextCity || nextProvince);
          setProvince(nextProvince || nextCity);
          setPostalCode(nextPostalCode);
          setLatitude(String(nextLatitude));
          setLongitude(String(nextLongitude));
          setCountryCode(nextCountryCode);
          setMapSearch(String(item?.display_name || `${nextLatitude}, ${nextLongitude}`).trim());
          setError("");
        } catch {
          setError(text.geolocationFailed);
        } finally {
          setIsResolvingDeviceLocation(false);
        }
      },
      (geoError) => {
        if (geoError?.code === 1) {
          setError(text.geolocationPermissionDenied);
        } else {
          setError(text.geolocationFailed);
        }
        setIsResolvingDeviceLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
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

    const mappedPricesDraft = prices
      .map((item, index) => ({
        id: item.id,
        name: String(item.name || "").trim(),
        priceType: SERVICE_PRICE_TYPES.includes(item.priceType) ? item.priceType : "TIME_BASED",
        billingUnit: item.billingUnit || "DAY",
        amount: Number(item.amount),
        currency: SERVICE_PRICE_CURRENCIES.includes(String(item.currency || "").trim().toUpperCase())
          ? String(item.currency || "").trim().toUpperCase()
          : "USD",
        isDefault: Boolean(item.isDefault) || (!prices.some((entry) => entry.isDefault) && index === 0),
        minUnits: Number(item.minUnits),
        maxUnits: Number(item.maxUnits),
      }))
      .filter(
        (item) =>
          item.name &&
          Number.isFinite(item.amount) &&
          item.amount > 0 &&
          Number.isInteger(item.minUnits) &&
          item.minUnits > 0 &&
          Number.isInteger(item.maxUnits) &&
          item.maxUnits >= item.minUnits,
      );
    const hasMappedDefault = mappedPricesDraft.some((item) => item.isDefault);
    const mappedPrices = mappedPricesDraft.map((item, index) => ({
      ...item,
      isDefault: item.isDefault || (!hasMappedDefault && index === 0),
    }));

    const payload = {
      category: selectedCategory
        ? {
            id: selectedCategory.id,
            slug: selectedCategory.slug,
            name: selectedCategory.name,
          }
        : null,
      subcategory: selectedSubcategory
        ? {
            id: selectedSubcategory.id,
            slug: selectedSubcategory.slug,
            name: selectedSubcategory.name,
          }
        : null,
      title: safeTitle,
      description: safeDescription,
      locationMode: safeLocationMode || "ONSITE,REMOTE",
      availability: {
        openDaysMask: buildOpenDaysMask(workingDays),
        startTime,
        endTime,
        slotDurationMinutes: Number(slotDuration),
        capacityPerSlot: Number(capacity),
      },
      location: {
        line1: safeLine1 || (hasCoordinatePair ? `${safeLatitude}, ${safeLongitude}` : ""),
        line2: safeLine2,
        district: safeDistrict,
        city: safeCity,
        province: safeProvince,
        postalCode: safePostalCode,
        countryCode: safeCountryCode || null,
        latitude: safeLatitude,
        longitude: safeLongitude,
        isDefault: true,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    if (step < steps.length) {
      await handleNext();
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.category}
                      </span>
                      <select
                        value={categoryId}
                        onChange={(event) => {
                          const nextCategoryId = event.target.value;
                          setCategoryId(nextCategoryId);
                          setSubcategoryId("");
                        }}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                        <option value="">{text.categoryPlaceholder}</option>
                        {DEFAULT_CATEGORIES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {pickLang(item.name, lang)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                        {text.subcategory}
                      </span>
                      <select
                        value={subcategoryId}
                        onChange={(event) => setSubcategoryId(event.target.value)}
                        disabled={!categoryId}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {categoryId ? text.subcategoryPlaceholder : text.subcategoryEmpty}
                        </option>
                        {availableSubcategories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {pickLang(item.name, lang)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                      {text.locationMode}
                    </span>
                    <p className="mb-2 text-xs text-text-muted">{text.locationModeHint}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => toggleLocationMode("ONSITE")}
                        className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                          normalizedLocationModes.includes("ONSITE")
                            ? "border-brand/60 bg-brand-soft/60 text-brand shadow-1"
                            : "border-border bg-bg-surface text-text-secondary hover:border-brand/35"
                        }`}
                      >
                        {text.locationModeOnsite}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLocationMode("REMOTE")}
                        className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                          normalizedLocationModes.includes("REMOTE")
                            ? "border-brand/60 bg-brand-soft/60 text-brand shadow-1"
                            : "border-border bg-bg-surface text-text-secondary hover:border-brand/35"
                        }`}
                      >
                        {text.locationModeRemote}
                      </button>
                    </div>
                  </div>

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
                  <p className="rounded-lg border border-brand/20 bg-brand-soft/20 px-3 py-2 text-xs text-text-secondary">
                    {text.googleMapHint}
                  </p>

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

                    <form onSubmit={handleMapSearchSubmit} className="mt-2 space-y-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                          {text.mapSearch}
                        </span>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                          <input
                            type="text"
                            value={mapSearch}
                            onChange={(event) => setMapSearch(event.target.value)}
                            placeholder={text.mapSearchPlaceholder}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                          <button
                            type="submit"
                            disabled={isResolvingMap || isResolvingDeviceLocation}
                            className="inline-flex h-10 items-center gap-1 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Search className="h-3.5 w-3.5" />
                            {text.searchMap}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearMapSearch}
                            disabled={!safeMapSearch || isResolvingMap || isResolvingDeviceLocation}
                            className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-bg-subtle px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            {text.clearMapSearch}
                          </button>
                        </div>
                      </label>
                    </form>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUseDeviceLocation}
                        disabled={isResolvingMap || isResolvingDeviceLocation}
                        className="inline-flex h-7 items-center rounded-pill border border-brand/45 bg-brand-soft/40 px-2.5 text-[11px] font-semibold text-brand transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isResolvingDeviceLocation ? text.gettingDeviceLocation : text.useDeviceLocation}
                      </button>
                      <button
                        type="button"
                        onClick={handleResolveFromMap}
                        disabled={isResolvingMap || isResolvingDeviceLocation}
                        className="inline-flex h-7 items-center rounded-pill border border-brand/45 bg-brand-soft/40 px-2.5 text-[11px] font-semibold text-brand transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isResolvingMap ? text.gettingFromMap : text.getFromMap}
                      </button>
                    </div>

                    <div className="relative mt-2 overflow-hidden rounded-lg border border-border bg-bg-subtle">
                      {canUseInteractiveGoogleMap ? (
                        <div
                          ref={mapContainerRef}
                          className="h-[32rem] w-full sm:h-[44rem]"
                          role="application"
                          aria-label={text.googleMap}
                        />
                      ) : (
                        <iframe
                          title={`Google map for ${safeTitle || "service location"}`}
                          src={googleMapEmbedUrl}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="h-[32rem] w-full border-0 sm:h-[44rem]"
                          allowFullScreen
                        />
                      )}

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="-translate-y-4 h-10 w-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                        >
                          <path
                            fill="#EF4444"
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
                          />
                          <circle cx="12" cy="9" r="2.7" fill="#FFFFFF" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-text-muted">{mapStatusHint}</p>
                      {isAutoSyncingAddress ? (
                        <span className="text-[11px] font-semibold text-brand">{text.updatingAddress}</span>
                      ) : null}
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-3">
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.selectedLocation}
                        </p>
                        <p className="mt-1 break-words text-text-primary">{selectedLocationText || mapQuery}</p>
                      </div>
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.coordinates}
                        </p>
                        <p className="mt-1 break-all text-text-primary">{coordinatesText}</p>
                      </div>
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.country}
                        </p>
                        <p className="mt-1 text-text-primary">{safeCountryCode || "-"}</p>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.line1}
                        </p>
                        <p className="mt-1 break-words text-text-primary">{safeLine1 || "-"}</p>
                        <p className="mt-1 text-[11px] text-text-muted">{text.line1Help}</p>
                      </div>
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.line2}
                        </p>
                        <p className="mt-1 break-words text-text-primary">{safeLine2 || "-"}</p>
                        <p className="mt-1 text-[11px] text-text-muted">{text.line2Help}</p>
                      </div>
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.district}
                        </p>
                        <p className="mt-1 break-words text-text-primary">{safeDistrict || "-"}</p>
                        <p className="mt-1 text-[11px] text-text-muted">{text.districtHelp}</p>
                      </div>
                      <div className="rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {text.province}
                        </p>
                        <p className="mt-1 break-words text-text-primary">{safeProvince || "-"}</p>
                        <p className="mt-1 text-[11px] text-text-muted">{text.provinceHelp}</p>
                      </div>
                    </div>
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
                            min="0.01"
                            step="0.01"
                            value={item.amount}
                            onChange={(event) => updatePrice(index, "amount", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </label>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.priceType}
                          </span>
                          <select
                            value={item.priceType}
                            onChange={(event) => updatePrice(index, "priceType", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          >
                            {SERVICE_PRICE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type === "FIXED" ? text.fixedPrice : text.timeBased}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
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

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.currency}
                          </span>
                          <select
                            value={item.currency}
                            onChange={(event) => updatePrice(index, "currency", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          >
                            {SERVICE_PRICE_CURRENCIES.map((currency) => (
                              <option key={currency} value={currency}>
                                {currency}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.minUnits}
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.minUnits}
                            onChange={(event) => updatePrice(index, "minUnits", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {text.maxUnits}
                          </span>
                          <input
                            type="number"
                            min={Math.max(1, Number(item.minUnits) || 1)}
                            step="1"
                            value={item.maxUnits}
                            onChange={(event) => updatePrice(index, "maxUnits", event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </label>
                      </div>
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
