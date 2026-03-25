import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Globe,
  Link2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import {
  fetchCurrentUser,
  fetchProviderProfile,
  updateCurrentUser,
  updateProvider,
  uploadProviderAvatar,
} from "../../api";
import { isProviderUser } from "../../admin/utils/adminAccess";
import { useLang } from "../../i18n/useLang";
import { persistCurrentUser } from "../auth/authStorage";
import {
  getProviderAvatarUploadId,
  getProviderProfileImage,
  hasProviderAvatar,
} from "../../utils/provider";

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const INPUT_WITH_ICON_CLASS =
  "h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const PROVIDER_AVATAR_FALLBACK = "/bussiness_placeholder.png";

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
    status: "Status",
    company: "Company",
    individual: "Individual",
    active: "Active",
    inactive: "Inactive",
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
    uploadImage: "Upload photo",
    changeImage: "Change photo",
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
    status: "ស្ថានភាព",
    company: "ក្រុមហ៊ុន",
    individual: "បុគ្គល",
    active: "សកម្ម",
    inactive: "មិនសកម្ម",
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
    uploadImage: "បញ្ចូលរូប",
    changeImage: "ប្តូររូប",
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
  status: "ACTIVE",
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

function InputWithIcon({ icon: Icon, className = INPUT_WITH_ICON_CLASS, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input {...props} className={className} />
    </div>
  );
}

export default function ProviderProfilePage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [currentUser, setCurrentUser] = useState(null);
  const [provider, setProvider] = useState(null);
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

        if (!isMounted) return;

        setCurrentUser(userResult);
        setProvider(providerResult);
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
          status: trim(providerResult?.status) || "ACTIVE",
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
  const avatarUrl = avatarDraft.previewUrl || getProviderProfileImage(provider) || PROVIDER_AVATAR_FALLBACK;

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
        status: trim(form.status) || "ACTIVE",
      });

      if (avatarDraft.file) {
        await uploadProviderAvatar(avatarDraft.file, {
          replace: hasProviderAvatar(provider),
          id: getProviderAvatarUploadId(provider),
        });
      }

      const [nextUser, nextProvider] = await Promise.all([
        fetchCurrentUser(),
        fetchProviderProfile(),
      ]);

      setCurrentUser(nextUser || updatedUser);
      setProvider(nextProvider);
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
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-5 shadow-1 sm:p-6">
        <h1 className="text-2xl font-bold text-text-primary">{text.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-5 shadow-1 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-text-secondary">{text.loading}</p>
        ) : !isProvider ? (
          <p className="text-sm text-danger">{text.noAccess}</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="rounded-xl border border-border bg-linear-to-br from-bg-app to-brand-soft/20 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <label
                  htmlFor="provider-avatar-upload"
                  className="group relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-border bg-bg-surface shadow-1"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={form.displayName || text.title} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-8 w-8 text-text-muted" />
                  )}
                </label>

                <div>
                  <p className="text-sm font-semibold text-text-primary">{form.displayName || text.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{text.imageHint}</p>
                  <label
                    htmlFor="provider-avatar-upload"
                    className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    {avatarUrl ? text.changeImage : text.uploadImage}
                  </label>
                  <input
                    id="provider-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{text.accountDetails}</p>
                <div className="mt-4 space-y-4">
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
              </article>

              <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{text.businessProfile}</p>
                <div className="mt-4 space-y-4">
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
              </article>
            </section>

            <section className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/10 p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block lg:col-span-2">
                  <FieldLabel>{text.bio}</FieldLabel>
                  <textarea value={form.bio} onChange={updateField("bio")} rows={5} className={TEXTAREA_CLASS} />
                </label>
                <label className="block">
                  <FieldLabel>{text.websiteUrl}</FieldLabel>
                  <InputWithIcon icon={Globe} type="text" value={form.websiteUrl} onChange={updateField("websiteUrl")} />
                </label>
                <label className="block">
                  <FieldLabel>{text.facebookUrl}</FieldLabel>
                  <InputWithIcon icon={Link2} type="text" value={form.facebookUrl} onChange={updateField("facebookUrl")} />
                </label>
                <label className="block">
                  <FieldLabel>{text.telegram}</FieldLabel>
                  <InputWithIcon icon={Phone} type="text" value={form.telegram} onChange={updateField("telegram")} />
                </label>
                <label className="block">
                  <FieldLabel>{text.status}</FieldLabel>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <select value={form.status} onChange={updateField("status")} className={INPUT_WITH_ICON_CLASS}>
                      <option value="ACTIVE">{text.active}</option>
                      <option value="INACTIVE">{text.inactive}</option>
                    </select>
                  </div>
                </label>
              </div>
            </section>

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

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? text.saving : text.saveChanges}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
