import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Globe,
  Link2,
  Mail,
  Phone,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import {
  fetchCurrentUser,
  fetchProviderAvatar,
  fetchProviderProfile,
  updateCurrentUser,
  updateProvider,
  updateProviderAvatar,
  uploadProviderAvatar,
} from "../../api";
import { isProviderUser } from "../../admin/utils/adminAccess";
import { useLang } from "../../i18n/useLang";
import { persistCurrentUser } from "../auth/authStorage";
import { getProviderProfileImage, hasProviderAvatar } from "../../utils/provider";

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const INPUT_WITH_ICON_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const PROVIDER_AVATAR_FALLBACK = "/bussiness_placeholder.png";
const PROVIDER_AVATAR_MAX_SIZE_MB = 3;

const UI_TEXT = {
  en: {
    title: "Provider Profile",
    subtitle: "Manage your account and provider business details.",
    accountDetails: "Account Details",
    businessProfile: "Business Profile",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phoneNumber: "Phone number",
    displayName: "Display name",
    businessName: "Business name",
    businessType: "Business type",
    establishedAt: "Established at",
    bio: "Bio",
    websiteUrl: "Website URL",
    facebookUrl: "Facebook URL",
    telegram: "Telegram / Phone",
    company: "Company",
    individual: "Individual",
    saveChanges: "Save Changes",
    saving: "Saving...",
    loadFailed: "Failed to load provider profile.",
    saveSuccess: "Provider profile updated successfully.",
    saveFailed: "Failed to update provider profile.",
    requiredFields: "Please complete all required account and provider fields.",
    invalidWebsiteUrl: "Please enter a valid website URL.",
    invalidFacebookUrl: "Please enter a valid Facebook URL.",
    imageHint: "JPG, PNG, WEBP up to 3MB",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Image size must be 3MB or less.",
    uploadImage: "Upload photo",
    changeImage: "Change photo",
    profileReadiness: "Profile Readiness",
    contactBlock: "Contact & Identity",
    bioBlock: "Story & Links",
    quickTips: "Quick Tips",
    completionLabel: "Profile completion",
    requiredBadge: "Required",
    optionalBadge: "Optional",
    verifiedAccount: "Verified account",
    providerMode: "Provider mode",
    avatarTitle: "Profile photo",
    avatarSubtitle: "A clear photo helps customers trust your brand faster.",
    bioHelper: "Tell customers what you do, what makes you different, and where you work.",
    websiteHelper: "We'll normalize the URL if you omit https://",
    telegramHelper: "Use your Telegram handle or contact number",
    completionReady: "Looking solid",
    completionNeedsWork: "Add the missing details to strengthen your profile.",
    tipOne: "Use a recognizable display name customers will remember.",
    tipTwo: "Keep your bio short, specific, and focused on your strongest services.",
    tipThree: "Add website or Facebook links so customers can verify your business.",
    loading: "Loading your provider profile...",
    noAccess: "Provider access required.",
  },
  km: {
    title: "ប្រវត្តិរូបអ្នកផ្តល់សេវា",
    subtitle: "គ្រប់គ្រងព័ត៌មានគណនី និងព័ត៌មានអាជីវកម្មរបស់អ្នក។",
    accountDetails: "ព័ត៌មានគណនី",
    businessProfile: "ព័ត៌មានអាជីវកម្ម",
    firstName: "នាមខ្លួន",
    lastName: "នាមត្រកូល",
    email: "អ៊ីមែល",
    phoneNumber: "លេខទូរស័ព្ទ",
    displayName: "ឈ្មោះបង្ហាញ",
    businessName: "ឈ្មោះអាជីវកម្ម",
    businessType: "ប្រភេទអាជីវកម្ម",
    establishedAt: "បង្កើតតាំងពី",
    bio: "ប្រវត្តិខ្លី",
    websiteUrl: "តំណវេបសាយ",
    facebookUrl: "តំណ Facebook",
    telegram: "Telegram / លេខទូរស័ព្ទ",
    company: "ក្រុមហ៊ុន",
    individual: "បុគ្គល",
    saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
    saving: "កំពុងរក្សាទុក...",
    loadFailed: "មិនអាចផ្ទុកប្រវត្តិរូបអ្នកផ្តល់សេវាបានទេ។",
    saveSuccess: "បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបអ្នកផ្តល់សេវារួចរាល់។",
    saveFailed: "មិនអាចធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបអ្នកផ្តល់សេវាបានទេ។",
    requiredFields: "សូមបំពេញព័ត៌មានគណនី និងព័ត៌មានអ្នកផ្តល់សេវាដែលចាំបាច់។",
    invalidWebsiteUrl: "សូមបញ្ចូលតំណវេបសាយឱ្យត្រឹមត្រូវ។",
    invalidFacebookUrl: "សូមបញ្ចូលតំណ Facebook ឱ្យត្រឹមត្រូវ។",
    imageHint: "JPG, PNG, WEBP ទំហំតិចជាង 3MB",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "ទំហំរូបភាពត្រូវតិចជាង ឬស្មើ 3MB។",
    uploadImage: "បញ្ចូលរូប",
    changeImage: "ប្តូររូប",
    profileReadiness: "ភាពរួចរាល់នៃប្រវត្តិរូប",
    contactBlock: "ទំនាក់ទំនង និងអត្តសញ្ញាណ",
    bioBlock: "ព័ត៌មាន និងតំណភ្ជាប់",
    quickTips: "គន្លឹះខ្លីៗ",
    completionLabel: "ការបំពេញប្រវត្តិរូប",
    requiredBadge: "ចាំបាច់",
    optionalBadge: "ជាជម្រើស",
    verifiedAccount: "គណនីបានផ្ទៀងផ្ទាត់",
    providerMode: "របៀបអ្នកផ្តល់សេវា",
    avatarTitle: "រូបប្រវត្តិរូប",
    avatarSubtitle: "រូបភាពច្បាស់លាស់ជួយឱ្យអតិថិជនទុកចិត្តលើអាជីវកម្មរបស់អ្នកបានលឿន។",
    bioHelper: "ប្រាប់អតិថិជនថាអ្នកធ្វើអ្វី អ្វីដែលធ្វើឱ្យអ្នកខុសប្លែក និងតំបន់ដែលអ្នកផ្តល់សេវា។",
    websiteHelper: "យើងនឹងបន្ថែម URL ឱ្យបានត្រឹមត្រូវ ប្រសិនបើអ្នកមិនបានដាក់ https://",
    telegramHelper: "ប្រើ Telegram handle ឬលេខទំនាក់ទំនងរបស់អ្នក",
    completionReady: "មើលទៅរួចរាល់ល្អ",
    completionNeedsWork: "បន្ថែមព័ត៌មានដែលខ្វះដើម្បីធ្វើឱ្យប្រវត្តិរូបរឹងមាំជាងមុន។",
    tipOne: "ប្រើឈ្មោះបង្ហាញដែលអតិថិជនងាយចងចាំ។",
    tipTwo: "រក្សាប្រវត្តិខ្លី បញ្ជាក់ច្បាស់ និងផ្តោតលើសេវាដែលអ្នកពូកែបំផុត។",
    tipThree: "បន្ថែមតំណវេបសាយ ឬ Facebook ដើម្បីឱ្យអតិថិជនអាចផ្ទៀងផ្ទាត់អាជីវកម្មអ្នកបាន។",
    loading: "កំពុងផ្ទុកប្រវត្តិរូបអ្នកផ្តល់សេវារបស់អ្នក...",
    noAccess: "សម្រាប់អ្នកផ្តល់សេវាតែប៉ុណ្ណោះ។",
  },
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  displayName: "",
  bio: "",
  businessName: "",
  businessType: "COMPANY",
  establishedAt: "",
  websiteUrl: "",
  facebookUrl: "",
  telegram: "",
};

function trim(value) {
  return String(value || "").trim();
}

function normalizeUrl(value) {
  const raw = trim(value);
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function isValidUrl(value) {
  const safeUrl = normalizeUrl(value);
  if (!safeUrl) return true;

  try {
    new URL(safeUrl);
    return true;
  } catch {
    return false;
  }
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
      {children}
    </span>
  );
}

function InputWithIcon({ icon, className = INPUT_WITH_ICON_CLASS, ...props }) {
  const Icon = icon;

  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input {...props} className={className} />
    </div>
  );
}

function SectionBadge({ children, tone = "brand" }) {
  const toneClassName =
    tone === "muted"
      ? "border-border bg-bg-app text-text-secondary"
      : "border-brand/15 bg-brand-soft/60 text-brand";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClassName}`}>
      {children}
    </span>
  );
}

export default function ProviderProfilePage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [currentUser, setCurrentUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [providerAvatar, setProviderAvatar] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarDraft, setAvatarDraft] = useState({ file: null, previewUrl: "" });

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [userResult, providerResult] = await Promise.all([
          fetchCurrentUser(),
          fetchProviderProfile(),
        ]);
        const avatarResult = providerResult?.imageUrl ? null : await fetchProviderAvatar();

        if (!isMounted) return;

        setCurrentUser(userResult);
        setProvider(providerResult);
        setProviderAvatar(avatarResult);
        persistCurrentUser(userResult, Boolean(localStorage.getItem("apsor:authSession")));
        setForm({
          firstName: trim(userResult?.firstName),
          lastName: trim(userResult?.lastName),
          email: trim(userResult?.email),
          phoneNumber: trim(userResult?.phoneNumber),
          displayName: trim(providerResult?.displayName),
          bio: trim(providerResult?.bio),
          businessName: trim(providerResult?.businessName),
          businessType: trim(providerResult?.businessType) || "COMPANY",
          establishedAt: trim(providerResult?.establishedAt).slice(0, 10),
          websiteUrl: trim(providerResult?.websiteUrl),
          facebookUrl: trim(providerResult?.facebookUrl),
          telegram: trim(providerResult?.telegram),
        });
      } catch (loadError) {
        console.error("Failed to load provider profile:", loadError);
        if (isMounted) {
          setError(text.loadFailed);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [text.loadFailed]);

  const isProvider = isProviderUser(currentUser);
  const avatarUrl =
    avatarDraft.previewUrl
    || providerAvatar?.imageUrl
    || getProviderProfileImage(provider)
    || PROVIDER_AVATAR_FALLBACK;
  const fullName = `${trim(form.firstName)} ${trim(form.lastName)}`.trim();
  const profileCompletionFields = [
    trim(form.firstName),
    trim(form.lastName),
    trim(form.phoneNumber),
    trim(form.displayName),
    trim(form.businessName),
    trim(form.businessType),
    trim(form.establishedAt),
    trim(form.bio),
    trim(form.websiteUrl),
    trim(form.facebookUrl),
    trim(form.telegram),
  ];
  const completedProfileFields = profileCompletionFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileFields / profileCompletionFields.length) * 100);

  const updateField = (key) => (event) => {
    const value = key === "bio" ? event.target.value.slice(0, 320) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || "").startsWith("image/")) {
      setError(text.invalidImageType);
      event.target.value = "";
      return;
    }

    if (file.size > PROVIDER_AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      setError(text.invalidImageSize);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDraft({
        file,
        previewUrl: typeof reader.result === "string" ? reader.result : "",
      });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const requiredValues = [
      trim(form.firstName),
      trim(form.lastName),
      trim(form.phoneNumber),
      trim(form.displayName),
      trim(form.businessName),
      trim(form.businessType),
      trim(form.establishedAt),
      trim(form.bio),
    ];

    if (requiredValues.some((value) => !value)) {
      setError(text.requiredFields);
      return;
    }

    if (!isValidUrl(form.websiteUrl)) {
      setError(text.invalidWebsiteUrl);
      return;
    }

    if (!isValidUrl(form.facebookUrl)) {
      setError(text.invalidFacebookUrl);
      return;
    }

    setIsSaving(true);

    try {
      const providerId = provider?.id || providerAvatar?.providerId || providerAvatar?.provider?.id || null;

      const updatedUser = await updateCurrentUser({
        firstName: trim(form.firstName),
        lastName: trim(form.lastName),
        phoneNumber: trim(form.phoneNumber),
      });

      await updateProvider({
        displayName: trim(form.displayName),
        bio: trim(form.bio),
        businessName: trim(form.businessName),
        businessType: trim(form.businessType),
        establishedAt: trim(form.establishedAt),
        websiteUrl: trim(form.websiteUrl) ? normalizeUrl(form.websiteUrl) : "",
        facebookUrl: trim(form.facebookUrl) ? normalizeUrl(form.facebookUrl) : "",
        telegram: trim(form.telegram),
      });

      if (avatarDraft.file) {
        if (hasProviderAvatar(providerAvatar || provider) && providerId) {
          await updateProviderAvatar(providerId, avatarDraft.file);
        } else {
          await uploadProviderAvatar(avatarDraft.file);
        }
      }

      const [nextUser, nextProvider] = await Promise.all([
        fetchCurrentUser(),
        fetchProviderProfile(),
      ]);
      const nextAvatar = nextProvider?.imageUrl ? null : await fetchProviderAvatar();

      setCurrentUser(nextUser || updatedUser);
      setProvider(nextProvider);
      setProviderAvatar(nextAvatar);
      persistCurrentUser(nextUser || updatedUser, Boolean(localStorage.getItem("apsor:authSession")));
      setAvatarDraft({ file: null, previewUrl: "" });
      setSuccess(text.saveSuccess);
    } catch (saveError) {
      console.error("Failed to update provider profile:", saveError);
      setError(
        saveError?.response?.data?.message
        || saveError?.response?.data?.error
        || text.saveFailed
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoading && currentUser && !isProvider) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="overflow-hidden rounded-[28px] border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/25 shadow-1">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-brand/8 via-brand-soft/40 to-transparent" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionBadge>{text.providerMode}</SectionBadge>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {text.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                {text.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {text.completionLabel}
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{profileCompletion}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {text.businessType}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {form.businessType === "INDIVIDUAL" ? text.individual : text.company}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {text.verifiedAccount}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-success">
                  <BadgeCheck className="h-4 w-4" />
                  {text.verifiedAccount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-border bg-bg-surface p-5 shadow-1 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-text-secondary">{text.loading}</p>
        ) : !isProvider ? (
          <p className="text-sm text-danger">{text.noAccess}</p>
        ) : (
          <form className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]" onSubmit={handleSubmit}>
            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              <section className="overflow-hidden rounded-3xl border border-border bg-linear-to-br from-bg-app via-bg-surface to-brand-soft/25 p-5 shadow-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SectionBadge>{text.profileReadiness}</SectionBadge>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">{profileCompletion}%</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {profileCompletion >= 80 ? text.completionReady : text.completionNeedsWork}
                    </p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand to-brand-hover transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/15 p-5 shadow-1">
                <div className="flex flex-col items-center text-center">
                  <label
                    htmlFor="provider-avatar-upload"
                    className="group relative grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-border bg-bg-surface shadow-1 transition hover:scale-[1.02]"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={form.displayName || text.title} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-9 w-9 text-text-muted" />
                    )}
                    <div className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                      <Camera className="h-3.5 w-3.5" />
                      {text.changeImage}
                    </div>
                  </label>

                  <p className="mt-4 text-lg font-bold text-text-primary">{form.displayName || fullName || text.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{form.businessName || form.email}</p>
                  <p className="mt-3 text-xs leading-5 text-text-muted">{text.avatarSubtitle}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <SectionBadge>{text.avatarTitle}</SectionBadge>
                    <SectionBadge tone="muted">{text.imageHint}</SectionBadge>
                  </div>

                  <label
                    htmlFor="provider-avatar-upload"
                    className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-app px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand"
                  >
                    <Camera className="h-4 w-4" />
                    {avatarDraft.file ? text.changeImage : text.uploadImage}
                  </label>
                  <input
                    id="provider-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-linear-to-br from-bg-surface to-brand-soft/10 p-5 shadow-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{text.quickTips}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border bg-bg-app/70 p-3">
                    <p className="text-sm font-semibold text-text-primary">{text.tipOne}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg-app/70 p-3">
                    <p className="text-sm font-semibold text-text-primary">{text.tipTwo}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg-app/70 p-3">
                    <p className="text-sm font-semibold text-text-primary">{text.tipThree}</p>
                  </div>
                </div>
              </section>
            </aside>

            <div className="space-y-5">
              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-danger" />
                  <p>{error}</p>
                </div>
              ) : null}

              {success ? (
                <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{success}</p>
                </div>
              ) : null}

              <section className="rounded-3xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-5 shadow-1 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{text.accountDetails}</p>
                    <h2 className="mt-2 text-xl font-bold text-text-primary">{text.contactBlock}</h2>
                  </div>
                  <SectionBadge tone="muted">{text.requiredBadge}</SectionBadge>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <FieldLabel>{text.firstName}</FieldLabel>
                    <InputWithIcon icon={UserRound} type="text" value={form.firstName} onChange={updateField("firstName")} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.lastName}</FieldLabel>
                    <InputWithIcon icon={UserRound} type="text" value={form.lastName} onChange={updateField("lastName")} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.email}</FieldLabel>
                    <InputWithIcon icon={Mail} type="email" value={form.email} disabled className={`${INPUT_WITH_ICON_CLASS} cursor-not-allowed opacity-70`} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.phoneNumber}</FieldLabel>
                    <InputWithIcon icon={Phone} type="text" value={form.phoneNumber} onChange={updateField("phoneNumber")} />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-5 shadow-1 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{text.businessProfile}</p>
                    <h2 className="mt-2 text-xl font-bold text-text-primary">{text.businessProfile}</h2>
                  </div>
                  <SectionBadge tone="muted">{text.requiredBadge}</SectionBadge>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <FieldLabel>{text.displayName}</FieldLabel>
                    <InputWithIcon icon={UserRound} type="text" value={form.displayName} onChange={updateField("displayName")} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.businessName}</FieldLabel>
                    <InputWithIcon icon={Building2} type="text" value={form.businessName} onChange={updateField("businessName")} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.businessType}</FieldLabel>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <select value={form.businessType} onChange={updateField("businessType")} className={INPUT_WITH_ICON_CLASS}>
                        <option value="COMPANY">{text.company}</option>
                        <option value="INDIVIDUAL">{text.individual}</option>
                      </select>
                    </div>
                  </label>
                  <label className="block">
                    <FieldLabel>{text.establishedAt}</FieldLabel>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input type="date" value={form.establishedAt} max={todayIso} onChange={updateField("establishedAt")} className={INPUT_WITH_ICON_CLASS} />
                    </div>
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-5 shadow-1 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{text.bioBlock}</p>
                    <h2 className="mt-2 text-xl font-bold text-text-primary">{text.bioBlock}</h2>
                  </div>
                  <SectionBadge tone="muted">{text.optionalBadge}</SectionBadge>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="block lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel>{text.bio}</FieldLabel>
                      <span className="text-xs font-medium text-text-muted">{form.bio.length}/320</span>
                    </div>
                    <textarea value={form.bio} onChange={updateField("bio")} rows={5} className={TEXTAREA_CLASS} />
                    <p className="mt-2 text-xs leading-5 text-text-muted">{text.bioHelper}</p>
                  </label>
                  <label className="block">
                    <FieldLabel>{text.websiteUrl}</FieldLabel>
                    <InputWithIcon icon={Globe} type="text" value={form.websiteUrl} onChange={updateField("websiteUrl")} />
                    <p className="mt-2 text-xs text-text-muted">{text.websiteHelper}</p>
                  </label>
                  <label className="block">
                    <FieldLabel>{text.facebookUrl}</FieldLabel>
                    <InputWithIcon icon={Link2} type="text" value={form.facebookUrl} onChange={updateField("facebookUrl")} />
                  </label>
                  <label className="block">
                    <FieldLabel>{text.telegram}</FieldLabel>
                    <InputWithIcon icon={Phone} type="text" value={form.telegram} onChange={updateField("telegram")} />
                    <p className="mt-2 text-xs text-text-muted">{text.telegramHelper}</p>
                  </label>
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-text-secondary">
                  {fullName || form.displayName ? (
                    <span>{fullName || form.displayName}</span>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-1 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? text.saving : text.saveChanges}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
