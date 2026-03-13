import { use, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import AuthStepProgress from "../../components/auth/AuthStepProgress";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useLang } from "../../i18n/useLang";
import { createProvider, uploadProviderAvatar } from "../../api";

const PROFILE_IMAGE_MAX_SIZE_MB = 3;
const BIO_MAX_LENGTH = 320;

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const INPUT_WITH_ICON_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

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
    requiredProfileFields:
      "Please complete display name, business details, date, and bio.",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Image size must be 3MB or less.",
    invalidEstablishedAt: "Please enter a valid established date.",
    invalidWebsiteUrl: "Please enter a valid website URL.",
    invalidFacebookUrl: "Please enter a valid Facebook URL.",
    submitSuccess: "Provider profile submitted successfully.",
    nextStep: "Next",
    backStep: "Back",
    skipContact: "Skip for now",
    submitButton: "Submit Provider Profile",
    backHome: "Back to Home",
    selectBusinessType: "Select business type",
    company: "Company",
    individual: "Individual",
    submitFailed: "Failed to submit provider profile.",
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
    requiredProfileFields:
      "សូមបំពេញឈ្មោះបង្ហាញ ព័ត៌មានអាជីវកម្ម កាលបរិច្ឆេទ និងប្រវត្តិខ្លី។",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "ទំហំរូបភាពត្រូវតិចជាង ឬស្មើ 3MB។",
    invalidEstablishedAt: "សូមបញ្ចូលកាលបរិច្ឆេទបង្កើតឱ្យត្រឹមត្រូវ។",
    invalidWebsiteUrl: "សូមបញ្ចូលតំណវេបសាយឱ្យត្រឹមត្រូវ។",
    invalidFacebookUrl: "សូមបញ្ចូលតំណ Facebook ឱ្យត្រឹមត្រូវ។",
    submitSuccess: "បានដាក់ស្នើប្រវត្តិរូបអ្នកផ្តល់សេវារួចរាល់។",
    nextStep: "បន្ទាប់",
    backStep: "ត្រឡប់",
    skipContact: "រំលងសិន",
    submitButton: "ដាក់ស្នើប្រវត្តិរូប",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    selectBusinessType: "ជ្រើសរើសប្រភេទអាជីវកម្ម",
    company: "ក្រុមហ៊ុន",
    individual: "បុគ្គល",
    submitFailed: "ការដាក់ស្នើប្រវត្តិរូបបានបរាជ័យ។",
  },
};

const INITIAL_FORM = {
  displayName: "",
  bio: "",
  businessName: "",
  businessType: "",
  establishedAt: "",
  websiteUrl: "",
  facebookUrl: "",
  telegram: "",
};

const INITIAL_IMAGE = {
  file: null,
  dataUrl: "",
  name: "",
};


const trim = (value) => String(value || "").trim();

function normalizeUrl(value) {
  const raw = trim(value);
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
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
  const raw = trim(value);
  if (!raw) return false;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return date <= today;
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
      {children}
    </span>
  );
}

function InputWithIcon({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input {...props} className={INPUT_WITH_ICON_CLASS} />
    </div>
  );
}

export default function BecomeProviderPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [profileImage, setProfileImage] = useState(INITIAL_IMAGE);

  const todayIso = new Date().toISOString().slice(0, 10);

  const steps = useMemo(
    () => [
      { label: text.stepProfile, icon: Building2 },
      { label: text.stepContact, icon: Link2 },
    ],
    [text.stepProfile, text.stepContact]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const updateField = (key) => (event) => {
    const value =
      key === "bio"
        ? event.target.value.slice(0, BIO_MAX_LENGTH)
        : event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const validateStepOne = () => {
    const requiredFields = [
      trim(form.displayName),
      trim(form.businessName),
      trim(form.businessType),
      trim(form.establishedAt),
      trim(form.bio),
    ];

    if (requiredFields.some((value) => !value)) {
      setError(text.requiredProfileFields);
      return false;
    }

    if (!isValidPastDate(form.establishedAt)) {
      setError(text.invalidEstablishedAt);
      return false;
    }

    return true;
  };

  const validateStepTwo = () => {
    if (trim(form.websiteUrl) && !isValidUrl(form.websiteUrl)) {
      setError(text.invalidWebsiteUrl);
      return false;
    }

    if (trim(form.facebookUrl) && !isValidUrl(form.facebookUrl)) {
      setError(text.invalidFacebookUrl);
      return false;
    }

    return true;
  };

  const buildPayload = (skipContact = false) => ({
    displayName: trim(form.displayName),
    bio: trim(form.bio).slice(0, BIO_MAX_LENGTH),
    businessName: trim(form.businessName),
    businessType: trim(form.businessType),
    establishedAt: trim(form.establishedAt),
    websiteUrl: skipContact
      ? ""
      : trim(form.websiteUrl)
        ? normalizeUrl(form.websiteUrl)
        : "",
    facebookUrl: skipContact
      ? ""
      : trim(form.facebookUrl)
        ? normalizeUrl(form.facebookUrl)
        : "",
    telegram: skipContact ? "" : trim(form.telegram),
  });

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
      setProfileImage({
        file,
        dataUrl: typeof reader.result === "string" ? reader.result : "",
        name: file.name || "",
      });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(INITIAL_IMAGE);
  };

  const goToStepTwo = () => {
    clearMessages();
    if (!validateStepOne()) return;
    setStep(2);
  };

  const submitProviderToBackend = async (skipContact = false) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const accessToken = localStorage.getItem("apsor:accessToken");

      if (!accessToken) {
        setError("Please sign in first.");
        window.location.href = "/signin";
        return;
      }

      const payload = buildPayload(skipContact);

      const provider = await createProvider(payload);

      if (profileImage.file) {
        await uploadProviderAvatar(profileImage.file);
      }

      setSuccess(text.submitSuccess);
      
      window.location.href = "/";

      console.log("Created provider:", provider);
    } catch (error) {
      console.error("Create provider failed:", error);
      setError(
        error?.response?.data?.message ||
        error?.message ||
        text.submitFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipContact = async () => {
    clearMessages();
    if (!validateStepOne()) return;
    await submitProviderToBackend(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (step === 1) {
      goToStepTwo();
      return;
    }

    if (!validateStepOne() || !validateStepTwo()) return;

    await submitProviderToBackend(false);
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
                    {profileImage.dataUrl ? (
                      <img
                        src={profileImage.dataUrl}
                        alt="Provider profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-8 w-8 text-text-muted" />
                    )}

                    <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 pb-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                      {profileImage.dataUrl
                        ? text.changePhoto
                        : text.uploadProfile}
                    </span>
                  </label>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {profileImage.name || text.profileImage}
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
                        {profileImage.dataUrl
                          ? text.changePhoto
                          : text.uploadProfile}
                      </label>

                      {profileImage.dataUrl ? (
                        <button
                          type="button"
                          onClick={removeProfileImage}
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
                  <FieldLabel>{text.displayName}</FieldLabel>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={updateField("displayName")}
                    placeholder={text.displayNamePlaceholder}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="block">
                  <FieldLabel>{text.businessName}</FieldLabel>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={updateField("businessName")}
                    placeholder={text.businessNamePlaceholder}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="block">
                  <FieldLabel>{text.businessType}</FieldLabel>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <select
                      value={form.businessType}
                      onChange={updateField("businessType")}
                      className={INPUT_WITH_ICON_CLASS}
                    >
                      <option value="">{text.selectBusinessType}</option>
                      <option value="COMPANY">{text.company}</option>
                      <option value="INDIVIDUAL">{text.individual}</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <FieldLabel>{text.establishedAt}</FieldLabel>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      type="date"
                      value={form.establishedAt}
                      max={todayIso}
                      onChange={updateField("establishedAt")}
                      className={INPUT_WITH_ICON_CLASS}
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <FieldLabel>{text.bio}</FieldLabel>
                <textarea
                  value={form.bio}
                  onChange={updateField("bio")}
                  placeholder={text.bioPlaceholder}
                  rows={5}
                  className={TEXTAREA_CLASS}
                />
                <p className="mt-1 text-right text-[11px] text-text-muted">
                  {form.bio.length}/{BIO_MAX_LENGTH}
                </p>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <FieldLabel>{text.websiteUrl}</FieldLabel>
                <InputWithIcon
                  icon={Globe}
                  type="text"
                  value={form.websiteUrl}
                  onChange={updateField("websiteUrl")}
                  placeholder={text.websiteUrlPlaceholder}
                />
              </label>

              <label className="block">
                <FieldLabel>{text.facebookUrl}</FieldLabel>
                <InputWithIcon
                  icon={Link2}
                  type="text"
                  value={form.facebookUrl}
                  onChange={updateField("facebookUrl")}
                  placeholder={text.facebookUrlPlaceholder}
                />
              </label>

              <label className="block">
                <FieldLabel>{text.telegram}</FieldLabel>
                <input
                  type="text"
                  value={form.telegram}
                  onChange={updateField("telegram")}
                  placeholder={text.telegramPlaceholder}
                  className={INPUT_CLASS}
                />
              </label>

              <div className="rounded-xl border border-border bg-bg-app p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.reviewTitle}
                </p>

                <div className="mt-2 space-y-1 text-sm text-text-secondary">
                  <p>
                    <span className="font-semibold text-text-primary">
                      {text.displayName}:
                    </span>{" "}
                    {form.displayName || "--"}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">
                      {text.businessName}:
                    </span>{" "}
                    {form.businessName || "--"}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">
                      {text.businessType}:
                    </span>{" "}
                    {form.businessType || "--"}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">
                      {text.websiteUrl}:
                    </span>{" "}
                    {trim(form.websiteUrl)
                      ? normalizeUrl(form.websiteUrl)
                      : "--"}
                  </p>
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
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed disabled:cursor-not-allowed disabled:opacity-60"
            >
              {text.nextStep}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" />
                {text.backStep}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSkipContact}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
              >
                {text.skipContact}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : text.submitButton}
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