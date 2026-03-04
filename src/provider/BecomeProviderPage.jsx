import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  Globe,
  ImagePlus,
  Link2,
  Send,
  UserRound,
} from "lucide-react";
import AuthStepProgress from "../components/auth/AuthStepProgress";
import Breadcrumb from "../components/shared/Breadcrumb";
import { useLang } from "../i18n/useLang";

const PROFILE_IMAGE_MAX_SIZE_MB = 3;
const BIO_MAX_LENGTH = 320;

const UI_TEXT = {
  en: {
    title: "Become Provider",
    subtitle: "Complete your provider profile in 2 steps.",
    stepProfile: "Business Profile",
    stepContact: "Contact & Channels",
    profileImage: "Profile image",
    uploadProfile: "Upload profile image",
    changePhoto: "Change photo",
    removePhoto: "Remove photo",
    imageHint: "JPG, PNG, WEBP up to 3MB",
    displayName: "Display name",
    displayNamePlaceholder: "Chan Dara",
    businessName: "Business name",
    businessNamePlaceholder: "Dara Hospitality Solutions",
    businessType: "Business type",
    establishedAt: "Established at",
    bio: "Bio",
    bioPlaceholder:
      "Experienced professional in hospitality services with a passion for customer satisfaction and efficient operations.",
    websiteUrl: "Website URL",
    websiteUrlPlaceholder: "https://www.darahospitality.com",
    facebookUrl: "Facebook URL",
    facebookUrlPlaceholder: "https://www.facebook.com/darahospitality",
    telegram: "Telegram / Phone",
    telegramPlaceholder: "+85512345678 or @darahospitality",
    reviewTitle: "Review",
    requiredProfileFields: "Please complete display name, business details, date, and bio.",
    requiredContactFields: "Please complete website, facebook, and telegram/phone.",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Image size must be 3MB or less.",
    invalidEstablishedAt: "Please enter a valid established date.",
    invalidWebsiteUrl: "Please enter a valid website URL.",
    invalidFacebookUrl: "Please enter a valid Facebook URL.",
    submitSuccess: "Provider profile draft has been saved.",
    nextStep: "Next",
    backStep: "Back",
    skipContact: "Skip for now",
    submitButton: "Submit Provider Profile",
    backHome: "Back to Home",
    selectBusinessType: "Select business type",
    company: "Company",
    individual: "Individual",
  },
  km: {
    title: "ក្លាយជាអ្នកផ្តល់សេវា",
    subtitle: "បំពេញប្រវត្តិរូបអ្នកផ្តល់សេវា ក្នុង ២ ជំហាន។",
    stepProfile: "ព័ត៌មានអាជីវកម្ម",
    stepContact: "ទំនាក់ទំនង និងបណ្តាញ",
    profileImage: "រូបប្រវត្តិរូប",
    uploadProfile: "បញ្ចូលរូបប្រវត្តិរូប",
    changePhoto: "ប្តូររូប",
    removePhoto: "លុបរូប",
    imageHint: "JPG, PNG, WEBP ទំហំតិចជាង 3MB",
    displayName: "ឈ្មោះបង្ហាញ",
    displayNamePlaceholder: "Chan Dara",
    businessName: "ឈ្មោះអាជីវកម្ម",
    businessNamePlaceholder: "Dara Hospitality Solutions",
    businessType: "ប្រភេទអាជីវកម្ម",
    establishedAt: "បង្កើតតាំងពី",
    bio: "ប្រវត្តិខ្លី",
    bioPlaceholder:
      "អ្នកជំនាញផ្នែកបដិសណ្ឋារកិច្ច ដែលផ្តោតលើការពេញចិត្តអតិថិជន និងការបំពេញការងារបានរហ័ស។",
    websiteUrl: "តំណវេបសាយ",
    websiteUrlPlaceholder: "https://www.darahospitality.com",
    facebookUrl: "តំណ Facebook",
    facebookUrlPlaceholder: "https://www.facebook.com/darahospitality",
    telegram: "Telegram / លេខទូរស័ព្ទ",
    telegramPlaceholder: "+85512345678 ឬ @darahospitality",
    reviewTitle: "ពិនិត្យឡើងវិញ",
    requiredProfileFields: "សូមបំពេញឈ្មោះបង្ហាញ ព័ត៌មានអាជីវកម្ម កាលបរិច្ឆេទ និងប្រវត្តិខ្លី។",
    requiredContactFields: "សូមបំពេញវេបសាយ Facebook និង Telegram/លេខទូរស័ព្ទ។",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "ទំហំរូបភាពត្រូវតិចជាង ឬស្មើ 3MB។",
    invalidEstablishedAt: "សូមបញ្ចូលកាលបរិច្ឆេទបង្កើតឱ្យត្រឹមត្រូវ។",
    invalidWebsiteUrl: "សូមបញ្ចូលតំណវេបសាយឱ្យត្រឹមត្រូវ។",
    invalidFacebookUrl: "សូមបញ្ចូលតំណ Facebook ឱ្យត្រឹមត្រូវ។",
    submitSuccess: "បានរក្សាទុកព្រាងប្រវត្តិរូបអ្នកផ្តល់សេវារួចរាល់។",
    nextStep: "បន្ទាប់",
    backStep: "ត្រឡប់",
    skipContact: "រំលងសិន",
    submitButton: "ដាក់ស្នើប្រវត្តិរូប",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    selectBusinessType: "ជ្រើសរើសប្រភេទអាជីវកម្ម",
    company: "ក្រុមហ៊ុន",
    individual: "បុគ្គល",
  },
};

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isValidUrl(value) {
  const safeUrl = normalizeUrl(value);
  if (!safeUrl) return false;
  try {
    new URL(safeUrl);
    return true;
  } catch {
    return false;
  }
}

function isValidPastDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date <= today;
}

export default function BecomeProviderPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [establishedAt, setEstablishedAt] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [telegram, setTelegram] = useState("");

  const [profileImageDataUrl, setProfileImageDataUrl] = useState("");
  const [profileImageName, setProfileImageName] = useState("");
  const todayIso = new Date().toISOString().slice(0, 10);

  const steps = useMemo(
    () => [
      { label: text.stepProfile, icon: Building2 },
      { label: text.stepContact, icon: Link2 },
    ],
    [text.stepContact, text.stepProfile],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const validateStepOne = () => {
    const safeDisplayName = String(displayName || "").trim();
    const safeBusinessName = String(businessName || "").trim();
    const safeBusinessType = String(businessType || "").trim();
    const safeEstablishedAt = String(establishedAt || "").trim();
    const safeBio = String(bio || "").trim();

    if (!safeDisplayName || !safeBusinessName || !safeBusinessType || !safeEstablishedAt || !safeBio) {
      setError(text.requiredProfileFields);
      return false;
    }

    if (!isValidPastDate(safeEstablishedAt)) {
      setError(text.invalidEstablishedAt);
      return false;
    }

    return true;
  };

  const validateStepTwo = () => {
    const safeWebsite = String(websiteUrl || "").trim();
    const safeFacebook = String(facebookUrl || "").trim();

    if (safeWebsite && !isValidUrl(safeWebsite)) {
      setError(text.invalidWebsiteUrl);
      return false;
    }

    if (safeFacebook && !isValidUrl(safeFacebook)) {
      setError(text.invalidFacebookUrl);
      return false;
    }

    return true;
  };

  const saveProviderPayload = ({ skipContact = false } = {}) => {
    const safeWebsite = String(websiteUrl || "").trim();
    const safeFacebook = String(facebookUrl || "").trim();
    const safeTelegram = String(telegram || "").trim();

    const payload = {
      displayName: String(displayName || "").trim(),
      bio: String(bio || "").trim().slice(0, BIO_MAX_LENGTH),
      businessName: String(businessName || "").trim(),
      businessType: String(businessType || "").trim(),
      establishedAt: String(establishedAt || "").trim(),
      websiteUrl: skipContact ? "" : safeWebsite ? normalizeUrl(safeWebsite) : "",
      facebookUrl: skipContact ? "" : safeFacebook ? normalizeUrl(safeFacebook) : "",
      telegram: skipContact ? "" : safeTelegram,
      profileImageDataUrl: profileImageDataUrl || "",
      profileImageName: profileImageName || "",
    };

    setError("");
    setSuccess(text.submitSuccess);
    sessionStorage.setItem("apsor:becomeProviderPayload", JSON.stringify(payload));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || "").startsWith("image/")) {
      setError(text.invalidImageType);
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      setError(text.invalidImageSize);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileImageDataUrl(result);
      setProfileImageName(file.name || "");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess("");

    if (step === 1) {
      if (!validateStepOne()) return;
      setError("");
      setStep(2);
      return;
    }

    if (!validateStepOne() || !validateStepTwo()) return;

    saveProviderPayload();
  };

  const handleSkipContact = () => {
    setSuccess("");
    if (!validateStepOne()) return;
    saveProviderPayload({ skipContact: true });
  };

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-bg-surface p-5 shadow-2 sm:p-7">
        <h1 className="text-2xl font-bold text-text-primary">{text.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>

        <AuthStepProgress steps={steps} currentStep={step} className="mt-4" />

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
            <>
              <div className="rounded-xl border border-border bg-linear-to-br from-bg-app to-brand-soft/20 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.profileImage}
                  </p>
                  <p className="text-[11px] text-text-muted">{text.imageHint}</p>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label
                    htmlFor="provider-profile-upload"
                    className="group relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-border bg-bg-surface shadow-1 transition hover:border-brand/45"
                  >
                    {profileImageDataUrl ? (
                      <img
                        src={profileImageDataUrl}
                        alt="Provider profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-8 w-8 text-text-muted" />
                    )}

                    <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 pb-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                      {profileImageDataUrl ? text.changePhoto : text.uploadProfile}
                    </span>
                  </label>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {profileImageName || text.profileImage}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {text.imageHint}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="provider-profile-upload"
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        {profileImageDataUrl ? text.changePhoto : text.uploadProfile}
                      </label>

                      {profileImageDataUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImageDataUrl("");
                            setProfileImageName("");
                          }}
                          className="inline-flex h-9 items-center rounded-lg border border-danger/35 bg-danger/10 px-3 text-xs font-semibold text-danger transition hover:bg-danger/15"
                        >
                          {text.removePhoto}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <input
                  id="provider-profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.displayName}
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder={text.displayNamePlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.businessName}
                  </span>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder={text.businessNamePlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.businessType}
                  </span>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <select
                      value={businessType}
                      onChange={(event) => setBusinessType(event.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="">{text.selectBusinessType}</option>
                      <option value="COMPANY">{text.company}</option>
                      <option value="INDIVIDUAL">{text.individual}</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.establishedAt}
                  </span>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      type="date"
                      value={establishedAt}
                      max={todayIso}
                      onChange={(event) => setEstablishedAt(event.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.bio}
                </span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
                  placeholder={text.bioPlaceholder}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <p className="mt-1 text-right text-[11px] text-text-muted">
                  {`${bio.length}/${BIO_MAX_LENGTH}`}
                </p>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.websiteUrl}
                </span>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder={text.websiteUrlPlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.facebookUrl}
                </span>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(event) => setFacebookUrl(event.target.value)}
                    placeholder={text.facebookUrlPlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.telegram}
                </span>
                <input
                  type="text"
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                  placeholder={text.telegramPlaceholder}
                  className="h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>

              <div className="rounded-xl border border-border bg-bg-app p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.reviewTitle}
                </p>
                <div className="mt-2 space-y-1 text-sm text-text-secondary">
                  <p><span className="font-semibold text-text-primary">{text.displayName}:</span> {displayName}</p>
                  <p><span className="font-semibold text-text-primary">{text.businessName}:</span> {businessName}</p>
                  <p><span className="font-semibold text-text-primary">{text.businessType}:</span> {businessType}</p>
                  <p><span className="font-semibold text-text-primary">{text.websiteUrl}:</span> {normalizeUrl(websiteUrl)}</p>
                </div>
              </div>
            </>
          )}

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

          {step === 1 ? (
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              {text.nextStep}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
              >
                <ArrowLeft className="h-4 w-4" />
                {text.backStep}
              </button>

              <button
                type="button"
                onClick={handleSkipContact}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
              >
                {text.skipContact}
              </button>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
              >
                <Send className="h-4 w-4" />
                {text.submitButton}
              </button>
            </div>
          )}
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-text-secondary">
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-semibold text-text-secondary transition hover:text-brand"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {text.backHome}
          </Link>
        </div>
      </section>
    </main>
  );
}
