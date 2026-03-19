import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpenDot,
  ImagePlus,
  Images,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import UploadField from "../../components/services/upload/UploadField";
import UploadInfoTile from "../../components/services/upload/UploadInfoTile";
import UploadStepCard from "../../components/services/upload/UploadStepCard";
import UploadToggleButton from "../../components/services/upload/UploadToggleButton";
import Breadcrumb from "../../components/shared/Breadcrumb";
import AdminSelect from "../../admin/components/AdminSelect";
import { useLang } from "../../i18n/useLang";
import {
  createService,
  createServiceAvailability,
  createServiceLocation,
  createServicePrice,
  fetchCategories,
  fetchProviderServiceById,
  fetchSubcategories,
  uploadServiceGalleryImage,
  updateService,
  updateServiceAvailability,
  updateServiceGalleryFile,
  updateServiceGallerySortOrder,
  updateServiceLocation,
  updateServicePrice,
} from "../../api";
import { getMediaUrl } from "../../utils/service";
import { formatBillingUnit, SERVICE_PRICE_BILLING_UNITS } from "../../utils/pricing";

const SERVICE_PRICE_TYPES = Object.freeze(["TIME_BASED", "FIXED"]);
const SERVICE_PRICE_CURRENCIES = Object.freeze(["USD", "KHR"]);
const LOCATION_MODE_OPTIONS = Object.freeze(["ONSITE", "REMOTE"]);
const DEFAULT_LOCATION_MODES = Object.freeze(["ONSITE", "REMOTE"]);
const DEFAULT_MAP_CENTER = Object.freeze({ lat: 11.5564, lng: 104.9282 });
const GOOGLE_MAP_SCRIPT_ID = "apsor-google-map-sdk";

const UI_TEXT = {
  en: {
    title: "Upload Service",
    editTitle: "Edit Service",
    subtitle: "Create a service in steps: summary, availability, location, price, and gallery.",
    editSubtitle: "Update your service details, pricing, location, and gallery.",
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
    saveDraft: "Save draft",
    savedAt: "Last saved",
    submit: "Save service",
    success: "Service created successfully.",
    successEdited: "Service updated successfully.",
    submitError: "Unable to save service right now. Please try again.",
    loadEditError: "Unable to load this service right now. Please try again.",
    loadingEdit: "Loading service details...",
    savingService: "Saving service...",
    coverImage: "Cover",
    defaultOptionHint: "Default plan used first when customer orders.",
    remove: "Remove",
  },
  km: {
    title: "បញ្ចូលសេវាកម្ម",
    editTitle: "កែប្រែសេវាកម្ម",
    subtitle: "បង្កើតសេវាកម្មតាមជំហាន៖ សង្ខេប ពេលវេលា ទីតាំង តម្លៃ និងវិចិត្រសាល។",
    editSubtitle: "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានសេវាកម្ម តម្លៃ ទីតាំង និងរូបភាព។",
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
    saveDraft: "រក្សាទុកព្រាង",
    savedAt: "បានរក្សាទុកចុងក្រោយ",
    submit: "រក្សាទុកសេវាកម្ម",
    success: "បានបង្កើតសេវាកម្មដោយជោគជ័យ។",
    successEdited: "បានធ្វើបច្ចុប្បន្នភាពសេវាកម្មដោយជោគជ័យ។",
    submitError: "មិនអាចរក្សាទុកសេវាកម្មបានទេ។ សូមសាកល្បងម្ដងទៀត។",
    loadEditError: "មិនអាចផ្ទុកព័ត៌មានសេវាកម្មនេះបានទេ។ សូមសាកល្បងម្ដងទៀត។",
    loadingEdit: "កំពុងផ្ទុកព័ត៌មានសេវាកម្ម...",
    savingService: "កំពុងរក្សាទុកសេវាកម្ម...",
    coverImage: "រូបមុខ",
    defaultOptionHint: "គម្រោងលំនាំដើមនឹងប្រើជាមុនពេលអតិថិជនបញ្ជាទិញ។",
    remove: "លុប",
  },
};

const MAX_GALLERY_FILES = 8;
const MAX_IMAGE_SIZE_MB = 10;
const COMPACT_FIELD_LABEL_CLASS_NAME =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary";

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

async function dataUrlToFile(dataUrl, fileName) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], fileName || `gallery.${extension}`, { type: blob.type || "image/png" });
}

function parseOptionalNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function mergeOptionById(items, fallbackItem) {
  const normalizedItems = Array.isArray(items) ? items : [];
  if (!fallbackItem?.id) return normalizedItems;

  const exists = normalizedItems.some((item) => String(item?.id) === String(fallbackItem.id));
  return exists ? normalizedItems : [fallbackItem, ...normalizedItems];
}

const KHMER_DIGIT_TO_ASCII = Object.freeze({
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
});

function normalizeDigits(value) {
  return String(value ?? "")
    .split("")
    .map((char) => KHMER_DIGIT_TO_ASCII[char] || char)
    .join("");
}

function sanitizeDecimalInput(value) {
  const normalized = normalizeDigits(value).replace(/,/g, ".");
  let output = "";
  let hasDot = false;

  for (const char of normalized) {
    if (char >= "0" && char <= "9") {
      output += char;
      continue;
    }
    if (char === "." && !hasDot) {
      output += char;
      hasDot = true;
    }
  }

  return output;
}

function sanitizeIntegerInput(value) {
  const normalized = normalizeDigits(value);
  return normalized.replace(/[^0-9]/g, "");
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

function parseLocationModes(value) {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => String(item || "").trim().toUpperCase())
      .filter(Boolean);

    if (normalized.includes("BOTH")) {
      return [...DEFAULT_LOCATION_MODES];
    }

    return normalized.filter((item) => LOCATION_MODE_OPTIONS.includes(item));
  }

  const normalized = String(value || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  if (normalized.includes("BOTH")) {
    return [...DEFAULT_LOCATION_MODES];
  }

  return normalized.filter((item) => LOCATION_MODE_OPTIONS.includes(item));
}

function parseWorkingDaysFromMask(value) {
  const safeMask = Number(value);
  if (!Number.isInteger(safeMask) || safeMask <= 0) {
    return [];
  }

  return Object.keys(OPEN_DAY_BIT).filter((day) => (safeMask & OPEN_DAY_BIT[day]) > 0);
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
    servicePriceId: null,
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

function getServiceLocationMode(modes) {
  const normalizedModes = Array.isArray(modes)
    ? modes.map((mode) => String(mode || "").trim().toUpperCase()).filter(Boolean)
    : [];

  if (normalizedModes.includes("ONSITE") && normalizedModes.includes("REMOTE")) {
    return "BOTH";
  }

  if (normalizedModes.includes("REMOTE")) {
    return "REMOTE";
  }

  return "ONSITE";
}

function getApiErrorMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message;

  return String(message || fallbackMessage || "").trim() || fallbackMessage;
}

export default function ServiceFormPage({ mode = "create" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const isEditMode = mode === "edit";
  const serviceId = String(
    params.id
    || searchParams.get("id")
    || location.state?.service?.id
    || "",
  ).trim();
  const editingService = location.state?.service || null;
  const pageTitle = isEditMode ? text.editTitle : text.title;
  const pageSubtitle = isEditMode ? text.editSubtitle : text.subtitle;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [serviceCategoryOption, setServiceCategoryOption] = useState(null);
  const [serviceSubcategoryOption, setServiceSubcategoryOption] = useState(null);
  const [locationModes, setLocationModes] = useState(isEditMode ? [] : [...DEFAULT_LOCATION_MODES]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduleType, setScheduleType] = useState("FLEXIBLE");
  const [workingDays, setWorkingDays] = useState(isEditMode ? [] : ["MON", "TUE", "WED", "THU", "FRI"]);
  const [startTime, setStartTime] = useState(isEditMode ? "" : "08:00");
  const [endTime, setEndTime] = useState(isEditMode ? "" : "17:00");
  const [slotDuration, setSlotDuration] = useState(isEditMode ? "" : "60");
  const [capacity, setCapacity] = useState(isEditMode ? "" : "1");

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

  const [prices, setPrices] = useState(isEditMode ? [] : [createPriceOption({ isDefault: true })]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);
  const [editingLocationId, setEditingLocationId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [isResolvingMap, setIsResolvingMap] = useState(false);
  const [isResolvingDeviceLocation, setIsResolvingDeviceLocation] = useState(false);
  const [isAutoSyncingAddress, setIsAutoSyncingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => sessionStorage.getItem("apsor:uploadServiceUpdatedAt"));
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
  useEffect(() => {
    let active = true;

    const loadTaxonomy = async () => {
      try {
        const [categoryItems, subcategoryItems] = await Promise.all([
          fetchCategories(),
          fetchSubcategories(),
        ]);

        if (!active) return;
        setCategories(Array.isArray(categoryItems) ? categoryItems : []);
        setSubcategories(Array.isArray(subcategoryItems) ? subcategoryItems : []);
      } catch (taxonomyError) {
        if (!active) return;
        console.error("Failed to fetch service taxonomy:", taxonomyError);
        setCategories([]);
        setSubcategories([]);
      }
    };

    loadTaxonomy();

    return () => {
      active = false;
    };
  }, []);

  const applyServiceToForm = (service) => {
    if (!service || typeof service !== "object") return;
    const normalizedService = Array.isArray(service.content)
      ? service.content[0]
      : Array.isArray(service.items)
        ? service.items[0]
        : service;

    if (!normalizedService || typeof normalizedService !== "object") return;

    const resolvedCategoryId = String(
      normalizedService.categoryId
      || normalizedService.category?.id
      || normalizedService.subCategory?.categoryId
      || normalizedService.subcategory?.categoryId
      || normalizedService.subCategory?.category?.id
      || normalizedService.subcategory?.category?.id
      || "",
    ).trim();
    const resolvedSubcategoryId = String(
      normalizedService.subCategoryId
      || normalizedService.subcategoryId
      || normalizedService.subCategory?.id
      || normalizedService.subcategory?.id
      || "",
    ).trim();
    const editingAvailabilities = Array.isArray(normalizedService.availability)
      ? normalizedService.availability
      : Array.isArray(normalizedService.availabilities)
        ? normalizedService.availabilities
        : [];
    const editingLocations = Array.isArray(normalizedService.location)
      ? normalizedService.location
      : Array.isArray(normalizedService.locations)
        ? normalizedService.locations
        : [];
    const editingPricesSource = Array.isArray(normalizedService.price)
      ? normalizedService.price
      : Array.isArray(normalizedService.prices)
        ? normalizedService.prices
        : [];
    const editingMediaSource = Array.isArray(normalizedService.serviceMedia)
      ? normalizedService.serviceMedia
      : Array.isArray(normalizedService.assets)
        ? normalizedService.assets
        : [];

    if (resolvedCategoryId) {
      setCategoryId(resolvedCategoryId);
    }

    if (resolvedSubcategoryId) {
      setSubcategoryId(resolvedSubcategoryId);
    }

    const resolvedCategoryName = normalizedService.category?.name
      || normalizedService.subCategory?.category?.name
      || normalizedService.subcategory?.category?.name
      || null;
    if (resolvedCategoryId && resolvedCategoryName) {
      setServiceCategoryOption({
        id: resolvedCategoryId,
        name: resolvedCategoryName,
      });
    }

    const resolvedSubcategoryName = normalizedService.subCategory?.name
      || normalizedService.subcategory?.name
      || null;
    if (resolvedSubcategoryId && resolvedSubcategoryName) {
      setServiceSubcategoryOption({
        id: resolvedSubcategoryId,
        categoryId: resolvedCategoryId || normalizedService.categoryId || normalizedService.category?.id || "",
        name: resolvedSubcategoryName,
      });
    }

    setTitle(String(normalizedService.title || ""));
    setDescription(String(normalizedService.description || ""));
    const editingLocationModes = parseLocationModes(normalizedService.locationMode || normalizedService.serviceLocationMode);
    setLocationModes(editingLocationModes.length ? editingLocationModes : [...DEFAULT_LOCATION_MODES]);

    const firstAvailability = editingAvailabilities[0] || null;
    if (firstAvailability) {
      setEditingAvailabilityId(firstAvailability.id ?? null);
      const editingWorkingDays = parseWorkingDaysFromMask(firstAvailability.openDaysMask);
      if (editingWorkingDays.length) {
        setWorkingDays(editingWorkingDays);
      }
      if (firstAvailability.startTime) setStartTime(String(firstAvailability.startTime));
      if (firstAvailability.endTime) setEndTime(String(firstAvailability.endTime));
      if (Number(firstAvailability.slotDurationMinutes) > 0) {
        setSlotDuration(String(firstAvailability.slotDurationMinutes));
      }
      if (Number(firstAvailability.capacityPerSlot) > 0) {
        setCapacity(String(firstAvailability.capacityPerSlot));
      }
      setScheduleType(firstAvailability.startTime && firstAvailability.endTime ? "FIXED" : "FLEXIBLE");
    }

    const firstLocation = editingLocations[0] || null;
    if (firstLocation) {
      setEditingLocationId(firstLocation.id ?? null);
      setLine1(String(firstLocation.line1 || ""));
      setLine2(String(firstLocation.line2 || ""));
      setDistrict(String(firstLocation.district || ""));
      setCity(String(firstLocation.city || ""));
      setProvince(String(firstLocation.province || ""));
      setPostalCode(String(firstLocation.postalCode || ""));
      setCountryCode(String(firstLocation.countryCode || "").toUpperCase());
      setLatitude(firstLocation.latitude != null ? String(firstLocation.latitude) : "");
      setLongitude(firstLocation.longitude != null ? String(firstLocation.longitude) : "");
    }

    const editingPrices = editingPricesSource
      .map((item, index) => ({
        id: String(item?.servicePriceId || item?.id || `price-${index + 1}`),
        servicePriceId: item?.servicePriceId ?? item?.id ?? null,
        name: String(item?.name || ""),
        priceType: SERVICE_PRICE_TYPES.includes(String(item?.priceType || "").toUpperCase())
          ? String(item?.priceType || "").toUpperCase()
          : "TIME_BASED",
        billingUnit: SERVICE_PRICE_BILLING_UNITS.includes(String(item?.billingUnit || "").toUpperCase())
          ? String(item?.billingUnit || "").toUpperCase()
          : "DAY",
        amount: item?.amount != null ? String(item.amount) : "",
        currency: SERVICE_PRICE_CURRENCIES.includes(String(item?.currency || "").toUpperCase())
          ? String(item?.currency || "").toUpperCase()
          : "USD",
        isDefault: Boolean(item?.isDefault),
        minUnits: item?.minUnits != null ? String(item.minUnits) : "1",
        maxUnits: item?.maxUnits != null ? String(item.maxUnits) : "90",
      }));
    if (editingPrices.length) {
      const hasDefaultPrice = editingPrices.some((item) => item.isDefault);
      setPrices(
        editingPrices.map((item, index) => ({
          ...item,
          isDefault: item.isDefault || (!hasDefaultPrice && index === 0),
        })),
      );
    }

    const editingGallery = editingMediaSource
      .map((item, index) => ({
        id: String(item?.serviceMediaId || item?.id || `gallery-${index + 1}`),
        serviceMediaId: item?.serviceMediaId ?? item?.id ?? null,
        name: String(item?.media?.originalFileName || item?.media?.fileName || item?.originalFileName || item?.fileName || `image-${index + 1}`),
        dataUrl: getMediaUrl(item?.media || item),
        file: null,
      }))
      .filter((item) => item.dataUrl);
    if (editingGallery.length) {
      setGalleryItems(editingGallery);
    }

    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (!isEditMode) return;

    let active = true;

    const loadEditService = async () => {
      if (editingService && typeof editingService === "object") {
        applyServiceToForm(editingService);
      }

      if (serviceId) {
        setIsLoadingEditData(true);

        try {
          const fetchedService = await fetchProviderServiceById(serviceId);
          if (!active) return;

          if (fetchedService && typeof fetchedService === "object") {
            applyServiceToForm(fetchedService);
            return;
          }

          setError(text.loadEditError);
        } catch (loadError) {
          if (!active) return;
          console.error("Failed to fetch editable service:", loadError);
          setError(getApiErrorMessage(loadError, text.loadEditError));
        } finally {
          if (active) {
            setIsLoadingEditData(false);
          }
        }

        return;
      }

      setError(text.loadEditError);
    };

    loadEditService();

    return () => {
      active = false;
    };
  }, [editingService, isEditMode, serviceId, text.loadEditError]);

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
  const categoryOptions = useMemo(
    () => mergeOptionById(categories, serviceCategoryOption),
    [categories, serviceCategoryOption],
  );
  const activeCategoryId = String(categoryId || serviceCategoryOption?.id || "").trim();
  const selectedCategory = useMemo(
    () => categoryOptions.find((item) => String(item?.id) === activeCategoryId) || serviceCategoryOption || null,
    [activeCategoryId, categoryOptions, serviceCategoryOption],
  );

  useEffect(() => {
    if (!subcategoryId || !Array.isArray(subcategories) || !subcategories.length) return;

    const matchedSubcategory = subcategories.find((item) => String(item?.id) === subcategoryId);
    if (!matchedSubcategory) return;

    const nextCategoryId = String(
      matchedSubcategory.categoryId
      || matchedSubcategory.category?.id
      || "",
    ).trim();

    if (!nextCategoryId || nextCategoryId === categoryId) return;
    setCategoryId(nextCategoryId);
  }, [categoryId, subcategories, subcategoryId]);

  const subcategoryOptions = useMemo(
    () => mergeOptionById(subcategories, serviceSubcategoryOption),
    [serviceSubcategoryOption, subcategories],
  );
  const activeSubcategoryId = String(subcategoryId || serviceSubcategoryOption?.id || "").trim();
  const availableSubcategories = useMemo(
    () => subcategoryOptions.filter((item) => String(item?.categoryId) === activeCategoryId),
    [subcategoryOptions, activeCategoryId],
  );
  const selectedSubcategory = useMemo(
    () =>
      availableSubcategories.find((item) => String(item?.id) === activeSubcategoryId)
      || serviceSubcategoryOption
      || null,
    [activeSubcategoryId, availableSubcategories, serviceSubcategoryOption],
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

  useEffect(() => {
    if (!categoryId && serviceCategoryOption?.id) {
      setCategoryId(String(serviceCategoryOption.id));
    }
  }, [categoryId, serviceCategoryOption]);

  useEffect(() => {
    if (!subcategoryId && serviceSubcategoryOption?.id) {
      setSubcategoryId(String(serviceSubcategoryOption.id));
    }
  }, [subcategoryId, serviceSubcategoryOption]);
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
  const savedAtText = useMemo(() => {
    if (!lastSavedAt) return "";
    const parsedDate = new Date(lastSavedAt);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  }, [lastSavedAt, lang]);

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
    let nextValue = value;
    if (key === "amount") {
      nextValue = sanitizeDecimalInput(value);
    } else if (key === "minUnits" || key === "maxUnits") {
      nextValue = sanitizeIntegerInput(value);
    } else if (key === "currency") {
      nextValue = String(value || "").trim().toUpperCase();
    }

    setPrices((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item)),
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

  const handleMapSearch = async () => {
    const query = String(mapSearch || "").trim();
    if (!query) {
      setError(text.requiredLocationMap);
      return;
    }
    await handleResolveFromMap(query);
  };

  const handleMapSearchInputKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void handleMapSearch();
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
        serviceMediaId: null,
        name: file.name || "image",
        dataUrl: await readFileAsDataUrl(file),
        file,
      })),
    );

    setGalleryItems((prev) => [...prev, ...prepared]);
    setError("");
    event.target.value = "";
  };

  const removeGalleryItem = (id) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveGalleryItem = (index, direction) => {
    setGalleryItems((prev) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
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
        serviceMediaId: item.serviceMediaId ?? null,
        name: item.name,
        dataUrl: item.dataUrl,
        sortOrder: index + 1,
      })),
    };

    setError("");
    setSuccess(isEditMode ? text.successEdited : text.success);
    const nowIso = new Date().toISOString();
    sessionStorage.setItem("apsor:uploadServicePayload", JSON.stringify(payload));
    sessionStorage.setItem("apsor:uploadServiceUpdatedAt", nowIso);
    setLastSavedAt(nowIso);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    if (isEditMode) {
      if (step < steps.length) {
        await handleNext();
        return;
      }

      if (!validateStep(step)) return;

      setIsSubmitting(true);
      setError("");

      try {
        if (!serviceId) {
          throw new Error(text.submitError);
        }

        await updateService(serviceId, {
          title: safeTitle,
          description: safeDescription,
          locationMode: getServiceLocationMode(normalizedLocationModes),
          status: "ACTIVE",
        });

        if (editingAvailabilityId) {
          await updateServiceAvailability(editingAvailabilityId, {
            serviceId: Number(serviceId),
            openDaysMask: buildOpenDaysMask(workingDays),
            startTime,
            endTime,
            slotDurationMinutes: Number(slotDuration),
            capacityPerSlot: Number(capacity),
          });
        }

        if (editingLocationId) {
          await updateServiceLocation(editingLocationId, {
            serviceId: Number(serviceId),
            line1: safeLine1 || (hasCoordinatePair ? `${safeLatitude}, ${safeLongitude}` : ""),
            line2: safeLine2,
            district: safeDistrict,
            city: safeCity,
            province: safeProvince,
            postalCode: safePostalCode,
            countryCode: safeCountryCode,
            latitude: safeLatitude,
            longitude: safeLongitude,
            isDefault: true,
          });
        }

        await Promise.all(
          prices
            .filter((item) => item?.servicePriceId)
            .map((item) =>
              updateServicePrice(item.servicePriceId, {
                name: String(item.name || "").trim(),
                priceType: SERVICE_PRICE_TYPES.includes(item.priceType) ? item.priceType : "TIME_BASED",
                billingUnit: item.billingUnit || "DAY",
                amount: Number(item.amount),
                currency: SERVICE_PRICE_CURRENCIES.includes(String(item.currency || "").trim().toUpperCase())
                  ? String(item.currency || "").trim().toUpperCase()
                  : "USD",
                isDefault: Boolean(item.isDefault),
                minUnits: Number(item.minUnits),
                maxUnits: Number(item.maxUnits),
                status: "ACTIVE",
              }),
            ),
        );

        await Promise.all(
          prices
            .filter((item) => !item?.servicePriceId)
            .map((item) =>
              createServicePrice({
                serviceId: Number(serviceId),
                name: String(item.name || "").trim(),
                priceType: SERVICE_PRICE_TYPES.includes(item.priceType) ? item.priceType : "TIME_BASED",
                billingUnit: item.billingUnit || "DAY",
                amount: Number(item.amount),
                currency: SERVICE_PRICE_CURRENCIES.includes(String(item.currency || "").trim().toUpperCase())
                  ? String(item.currency || "").trim().toUpperCase()
                  : "USD",
                isDefault: Boolean(item.isDefault),
                minUnits: Number(item.minUnits),
                maxUnits: Number(item.maxUnits),
              }),
            ),
        );

        const nextGalleryItems = [];

        for (const item of galleryItems) {
          const file = item.file
            ? item.file
            : null;
          let nextServiceMediaId = item.serviceMediaId ?? null;

          if (file && nextServiceMediaId) {
            await updateServiceGalleryFile(serviceId, nextServiceMediaId, file);
          } else if (file && !nextServiceMediaId) {
            const uploadedMedia = await uploadServiceGalleryImage(serviceId, file);
            nextServiceMediaId = uploadedMedia?.serviceMediaId ?? uploadedMedia?.id ?? uploadedMedia?.data?.serviceMediaId ?? null;
          }

          nextGalleryItems.push({
            ...item,
            serviceMediaId: nextServiceMediaId,
          });
        }

        await Promise.all(
          nextGalleryItems
            .filter((item) => item?.serviceMediaId)
            .map((item, index) =>
              updateServiceGallerySortOrder(serviceId, item.serviceMediaId, index + 1),
            ),
        );

        setGalleryItems(nextGalleryItems);

        if (nextGalleryItems.some((item) => item.file)) {
          setGalleryItems((current) => current.map((item) => ({ ...item, file: null })));
        }

        setSuccess(text.successEdited);
        window.setTimeout(() => {
          navigate("/admin/service");
        }, 700);
      } catch (submitError) {
        setError(getApiErrorMessage(submitError, text.submitError));
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (step < steps.length) {
      await handleNext();
      return;
    }

    if (!validateStep(step)) return;

    const mappedPricesDraft = prices
      .map((item, index) => ({
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

    setIsSubmitting(true);
    setError("");

    try {
      const createdService = await createService({
        title: safeTitle,
        description: safeDescription,
        subCategoryId: Number(subcategoryId),
        locationMode: getServiceLocationMode(normalizedLocationModes),
      });

      const serviceId = createdService?.id;
      if (!serviceId) {
        throw new Error(text.submitError);
      }

      await createServiceAvailability({
        serviceId,
        openDaysMask: buildOpenDaysMask(workingDays),
        startTime,
        endTime,
        slotDurationMinutes: Number(slotDuration),
        capacityPerSlot: Number(capacity),
      });

      await createServiceLocation({
        serviceId,
        line1: safeLine1 || (hasCoordinatePair ? `${safeLatitude}, ${safeLongitude}` : ""),
        line2: safeLine2,
        district: safeDistrict,
        city: safeCity,
        province: safeProvince,
        postalCode: safePostalCode,
        countryCode: safeCountryCode,
        latitude: safeLatitude,
        longitude: safeLongitude,
        isDefault: true,
      });

      await Promise.all(
        mappedPrices.map((item) =>
          createServicePrice({
            serviceId,
            ...item,
          }),
        ),
      );

      for (const [index, item] of galleryItems.entries()) {
        const file = item.file || await dataUrlToFile(item.dataUrl, item.name || `gallery-${index + 1}.png`);
        await uploadServiceGalleryImage(serviceId, file);
      }

      sessionStorage.removeItem("apsor:uploadServicePayload");
      sessionStorage.removeItem("apsor:uploadServiceUpdatedAt");
      setLastSavedAt("");
      setSuccess(text.success);
      window.setTimeout(() => {
        navigate("/upload-service");
      }, 700);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, text.submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = () => {
    setSuccess("");
    savePayload();
  };

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={pageTitle} />

      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-border bg-bg-surface/95 p-4 shadow-2 backdrop-blur sm:p-6 lg:p-7">
        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-linear-to-r from-brand-soft/65 via-bg-surface to-bg-subtle p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-linear-to-l from-brand/8 to-transparent" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-1">
                <Upload className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{pageTitle}</h1>
                <p className="text-sm text-text-secondary">
                  {isLoadingEditData ? text.loadingEdit : pageSubtitle}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {t.backHome || "Back home"}
            </Link>
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

        <div className="mt-5">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {step === 1 ? (
              <UploadStepCard title={text.summaryTitle}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <UploadField label={text.category}>
                    <AdminSelect
                      value={activeCategoryId}
                      onChange={(event) => {
                        const nextCategoryId = event.target.value;
                        setCategoryId(nextCategoryId);
                        setSubcategoryId("");
                      }}
                      className="h-11 rounded-lg"
                      placeholder={text.categoryPlaceholder}
                      aria-label={text.category}
                    >
                      {categoryOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {pickLang(item.name, lang)}
                        </option>
                      ))}
                    </AdminSelect>
                  </UploadField>

                  <UploadField label={text.subcategory}>
                    <AdminSelect
                      value={activeSubcategoryId}
                      onChange={(event) => setSubcategoryId(event.target.value)}
                      disabled={!activeCategoryId}
                      className="h-11 rounded-lg"
                      placeholder={activeCategoryId ? text.subcategoryPlaceholder : text.subcategoryEmpty}
                      aria-label={text.subcategory}
                    >
                      {availableSubcategories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {pickLang(item.name, lang)}
                        </option>
                      ))}
                    </AdminSelect>
                  </UploadField>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.locationMode}
                  </p>
                  <p className="mb-2 text-xs text-text-muted">{text.locationModeHint}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <UploadToggleButton
                      active={normalizedLocationModes.includes("ONSITE")}
                      onClick={() => toggleLocationMode("ONSITE")}
                    >
                      {text.locationModeOnsite}
                    </UploadToggleButton>
                    <UploadToggleButton
                      active={normalizedLocationModes.includes("REMOTE")}
                      onClick={() => toggleLocationMode("REMOTE")}
                    >
                      {text.locationModeRemote}
                    </UploadToggleButton>
                  </div>
                </div>

                <UploadField label={text.serviceTitle}>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={text.serviceTitlePlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </UploadField>

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
              </UploadStepCard>
            ) : null}

            {step === 2 ? (
              <UploadStepCard title={text.availabilityTitle}>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.scheduleType}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <UploadToggleButton
                      active={scheduleType === "FLEXIBLE"}
                      onClick={() => setScheduleType("FLEXIBLE")}
                    >
                      {text.flexibleSchedule}
                    </UploadToggleButton>
                    <UploadToggleButton
                      active={scheduleType === "FIXED"}
                      onClick={() => setScheduleType("FIXED")}
                    >
                      {text.fixedHours}
                    </UploadToggleButton>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.workingDays}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                    {DAYS.map((day) => (
                      <UploadToggleButton
                        key={day.value}
                        active={workingDays.includes(day.value)}
                        onClick={() => toggleWorkingDay(day.value)}
                        size="sm"
                      >
                        {lang === "km" ? day.km : day.en}
                      </UploadToggleButton>
                    ))}
                  </div>
                </div>

                {scheduleType === "FIXED" ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <UploadField label={text.startTime}>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </UploadField>
                    <UploadField label={text.endTime}>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                        className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </UploadField>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <UploadField label={text.slotDuration}>
                    <input
                      type="number"
                      min="1"
                      value={slotDuration}
                      onChange={(event) => setSlotDuration(event.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </UploadField>
                  <UploadField label={text.capacityPerSlot}>
                    <input
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </UploadField>
                </div>
              </UploadStepCard>
            ) : null}

            {step === 3 ? (
              <UploadStepCard title={text.locationTitle}>
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

                  <div className="mt-2 space-y-2">
                    <UploadField label={text.mapSearch} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                        <input
                          type="text"
                          value={mapSearch}
                          onChange={(event) => setMapSearch(event.target.value)}
                          onKeyDown={handleMapSearchInputKeyDown}
                          placeholder={text.mapSearchPlaceholder}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void handleMapSearch();
                          }}
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
                    </UploadField>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <UploadToggleButton
                      active
                      size="pill"
                      className="rounded-pill border-brand/45 bg-brand-soft/40 text-brand hover:border-brand"
                      disabled={isResolvingMap || isResolvingDeviceLocation}
                      onClick={handleUseDeviceLocation}
                    >
                      {isResolvingDeviceLocation ? text.gettingDeviceLocation : text.useDeviceLocation}
                    </UploadToggleButton>
                    <UploadToggleButton
                      active
                      size="pill"
                      className="rounded-pill border-brand/45 bg-brand-soft/40 text-brand hover:border-brand"
                      disabled={isResolvingMap || isResolvingDeviceLocation}
                      onClick={handleResolveFromMap}
                    >
                      {isResolvingMap ? text.gettingFromMap : text.getFromMap}
                    </UploadToggleButton>
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
                    <UploadInfoTile title={text.selectedLocation} value={selectedLocationText || mapQuery} />
                    <UploadInfoTile title={text.coordinates} value={coordinatesText} valueClassName="break-all" />
                    <UploadInfoTile title={text.country} value={safeCountryCode} />
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
                    <UploadInfoTile title={text.line1} value={safeLine1} hint={text.line1Help} />
                    <UploadInfoTile title={text.line2} value={safeLine2} hint={text.line2Help} />
                    <UploadInfoTile title={text.district} value={safeDistrict} hint={text.districtHelp} />
                    <UploadInfoTile title={text.province} value={safeProvince} hint={text.provinceHelp} />
                  </div>
                </div>
              </UploadStepCard>
            ) : null}

            {step === 4 ? (
              <UploadStepCard
                title={text.priceTitle}
                action={(
                  <button
                    type="button"
                    onClick={addPriceOption}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/45 bg-brand-soft/40 px-3 text-xs font-semibold text-brand transition hover:border-brand"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {text.addOption}
                  </button>
                )}
              >
                {prices.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 shadow-1 ${item.isDefault ? "border-brand/45 bg-brand-soft/15" : "border-border bg-bg-surface"
                      }`}
                  >
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
                    {item.isDefault ? (
                      <p className="mt-1 text-[11px] font-medium text-brand">{text.defaultOptionHint}</p>
                    ) : null}

                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <UploadField
                        className="block sm:col-span-2"
                        label={text.optionName}
                        labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}
                      >
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) => updatePrice(index, "name", event.target.value)}
                          placeholder={text.optionNamePlaceholder}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </UploadField>

                      <UploadField label={text.priceAmount} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(event) => updatePrice(index, "amount", event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </UploadField>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <UploadField label={text.priceType} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <AdminSelect
                          value={item.priceType}
                          onChange={(event) => updatePrice(index, "priceType", event.target.value)}
                          className="h-10 rounded-lg"
                          aria-label={text.priceType}
                        >
                          {SERVICE_PRICE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type === "FIXED" ? text.fixedPrice : text.timeBased}
                            </option>
                          ))}
                        </AdminSelect>
                      </UploadField>

                      <UploadField label={text.billingUnit} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <AdminSelect
                          value={item.billingUnit}
                          onChange={(event) => updatePrice(index, "billingUnit", event.target.value)}
                          className="h-10 rounded-lg"
                          aria-label={text.billingUnit}
                        >
                          {SERVICE_PRICE_BILLING_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {formatBillingUnit(unit, t)}
                            </option>
                          ))}
                        </AdminSelect>
                      </UploadField>

                      <UploadField label={text.currency} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <AdminSelect
                          value={item.currency}
                          onChange={(event) => updatePrice(index, "currency", event.target.value)}
                          className="h-10 rounded-lg"
                          aria-label={text.currency}
                        >
                          {SERVICE_PRICE_CURRENCIES.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </AdminSelect>
                      </UploadField>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <UploadField label={text.minUnits} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1"
                          value={item.minUnits}
                          onChange={(event) => updatePrice(index, "minUnits", event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </UploadField>

                      <UploadField label={text.maxUnits} labelClassName={COMPACT_FIELD_LABEL_CLASS_NAME}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="90"
                          value={item.maxUnits}
                          onChange={(event) => updatePrice(index, "maxUnits", event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </UploadField>
                    </div>
                  </div>
                ))}
              </UploadStepCard>
            ) : null}

            {step === 5 ? (
              <UploadStepCard
                title={text.galleryTitle}
                action={(
                  <span className="inline-flex h-7 items-center rounded-pill border border-brand/30 bg-brand-soft/45 px-2.5 text-[11px] font-semibold text-brand">
                    {`${galleryItems.length}/${MAX_GALLERY_FILES}`}
                  </span>
                )}
              >
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
                    {galleryItems.map((item, index) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border bg-bg-surface">
                        <img src={item.dataUrl} alt={item.name} className="h-24 w-full object-cover sm:h-28" />
                        {index === 0 ? (
                          <span className="absolute left-1 top-1 inline-flex h-6 items-center rounded-md bg-brand px-2 text-[10px] font-semibold text-white">
                            {text.coverImage}
                          </span>
                        ) : null}
                        <div className="absolute bottom-1 left-1 flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(index, "up")}
                            disabled={index === 0}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-white/90 text-text-secondary opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Move image up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(index, "down")}
                            disabled={index === galleryItems.length - 1}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-white/90 text-text-secondary opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Move image down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
              </UploadStepCard>
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

            <div className="rounded-xl border border-border bg-bg-subtle/60 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {text.backStep}
                </button>

                <div className="flex flex-col gap-2 sm:items-end">
                  {savedAtText ? (
                    <p className="text-[11px] font-medium text-text-muted">{`${text.savedAt}: ${savedAtText}`}</p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveDraftClick}
                      disabled={isSubmitting}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
                    >
                      <Save className="h-4 w-4" />
                      {text.saveDraft}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
                    >
                      <Upload className="h-4 w-4" />
                      {isSubmitting ? text.savingService : step === steps.length ? text.submit : text.nextStep}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
