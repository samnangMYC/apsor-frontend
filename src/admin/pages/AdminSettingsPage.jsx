import { useEffect, useMemo, useState } from "react";
import { AtSign, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { fetchCurrentUser, updateCurrentUser } from "../../api";
import { useLang } from "../../i18n/useLang";
import { getStoredCurrentUser, persistCurrentUser } from "../../page/auth/authStorage";

const UI_TEXT = {
  en: {
    eyebrow: "Settings",
    title: "Admin Account Settings",
    subtitle: "Manage the account details used across the admin dashboard.",
    accountTitle: "Account details",
    accountHint: "Update your profile information. Username and email are shown for reference.",
    profileTitle: "Profile summary",
    profileHint: "A quick snapshot of the signed-in admin account.",
    firstName: "First name",
    lastName: "Last name",
    username: "Username",
    email: "Email",
    phoneNumber: "Phone number",
    role: "Access role",
    status: "Status",
    save: "Save changes",
    saving: "Saving...",
    loading: "Loading your settings...",
    loadFailed: "Failed to load account settings.",
    saveFailed: "Failed to save account settings.",
    saveSuccess: "Account settings updated successfully.",
    requiredFields: "Please complete your first name, last name, and phone number.",
    active: "Active",
    admin: "Admin",
    noData: "N/A",
  },
  km: {
    eyebrow: "ការកំណត់",
    title: "ការកំណត់គណនីអ្នកគ្រប់គ្រង",
    subtitle: "គ្រប់គ្រងព័ត៌មានគណនីដែលប្រើនៅទូទាំងផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង។",
    accountTitle: "ព័ត៌មានគណនី",
    accountHint: "កែប្រែព័ត៌មានប្រវត្តិរូបរបស់អ្នក។ Username និង email ត្រូវបានបង្ហាញសម្រាប់យោង។",
    profileTitle: "សង្ខេបប្រវត្តិរូប",
    profileHint: "ទិដ្ឋភាពខ្លីៗនៃគណនី admin ដែលបានចូលប្រើប្រាស់។",
    firstName: "នាមខ្លួន",
    lastName: "នាមត្រកូល",
    username: "ឈ្មោះគណនី",
    email: "អ៊ីមែល",
    phoneNumber: "លេខទូរស័ព្ទ",
    role: "តួនាទីចូលប្រើ",
    status: "ស្ថានភាព",
    save: "រក្សាទុកការផ្លាស់ប្តូរ",
    saving: "កំពុងរក្សាទុក...",
    loading: "កំពុងផ្ទុកការកំណត់របស់អ្នក...",
    loadFailed: "មិនអាចផ្ទុកការកំណត់គណនីបានទេ។",
    saveFailed: "មិនអាចរក្សាទុកការកំណត់គណនីបានទេ។",
    saveSuccess: "បានធ្វើបច្ចុប្បន្នភាពការកំណត់គណនីរួចរាល់។",
    requiredFields: "សូមបំពេញនាមខ្លួន នាមត្រកូល និងលេខទូរស័ព្ទ។",
    active: "កំពុងសកម្ម",
    admin: "អ្នកគ្រប់គ្រង",
    noData: "មិនមានទិន្នន័យ",
  },
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
};

function trim(value) {
  return String(value || "").trim();
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
      {children}
    </span>
  );
}

function InputField({ label, icon, type = "text", value, onChange, disabled = false }) {
  const Icon = icon;

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-11 w-full rounded-xl border border-border pl-10 pr-3 text-sm outline-none transition ${
            disabled
              ? "cursor-not-allowed bg-bg-subtle/70 text-text-muted"
              : "bg-bg-surface text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20"
          }`}
        />
      </div>
    </label>
  );
}

export default function AdminSettingsPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [currentUser, setCurrentUser] = useState(() => getStoredCurrentUser());
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const user = await fetchCurrentUser();

        if (!isMounted) {
          return;
        }

        setCurrentUser(user);
        setForm({
          firstName: trim(user?.firstName),
          lastName: trim(user?.lastName),
          phoneNumber: trim(user?.phoneNumber),
        });
        persistCurrentUser(user, Boolean(localStorage.getItem("apsor:authSession")));
      } catch (error) {
        console.error("Failed to load admin settings:", error);

        if (isMounted) {
          setErrorMessage(text.loadFailed);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [text.loadFailed]);

  const fullName = useMemo(
    () => `${trim(form.firstName)} ${trim(form.lastName)}`.trim() || text.noData,
    [form.firstName, form.lastName, text.noData],
  );

  const stats = useMemo(
    () => [
      { label: text.role, value: text.admin, icon: ShieldCheck },
      { label: text.status, value: text.active, icon: UserRound },
      { label: text.username, value: currentUser?.username || text.noData, icon: AtSign },
    ],
    [currentUser?.username, text.active, text.admin, text.noData, text.role, text.status, text.username],
  );

  const updateField = (key) => (event) => {
    setErrorMessage("");
    setSuccessMessage("");
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      firstName: trim(form.firstName),
      lastName: trim(form.lastName),
      phoneNumber: trim(form.phoneNumber),
    };

    if (!payload.firstName || !payload.lastName || !payload.phoneNumber) {
      setErrorMessage(text.requiredFields);
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updateCurrentUser(payload);
      const nextUser = {
        ...(currentUser && typeof currentUser === "object" ? currentUser : {}),
        ...(updatedUser && typeof updatedUser === "object" ? updatedUser : {}),
        ...payload,
      };

      setCurrentUser(nextUser);
      persistCurrentUser(nextUser, Boolean(localStorage.getItem("apsor:authSession")));
      setSuccessMessage(text.saveSuccess);
    } catch (error) {
      console.error("Failed to save admin settings:", error);
      setErrorMessage(
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.saveFailed,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/25 p-5 shadow-1 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{text.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{text.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{text.subtitle}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-2xl border border-border bg-white/75 px-4 py-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{item.label}</p>
                <div className="mt-2 flex items-center gap-2 text-text-primary">
                  <Icon className="h-4 w-4 text-brand" />
                  <span className="truncate text-sm font-semibold">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-bg-surface px-5 py-8 text-sm text-text-secondary shadow-1">
          {text.loading}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <article className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{text.accountTitle}</h2>
                <p className="mt-1 text-sm text-text-secondary">{text.accountHint}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InputField label={text.firstName} icon={UserRound} value={form.firstName} onChange={updateField("firstName")} />
              <InputField label={text.lastName} icon={UserRound} value={form.lastName} onChange={updateField("lastName")} />
              <InputField label={text.username} icon={AtSign} value={currentUser?.username || ""} disabled />
              <InputField label={text.email} icon={Mail} type="email" value={currentUser?.email || ""} disabled />
              <div className="md:col-span-2">
                <InputField label={text.phoneNumber} icon={Phone} value={form.phoneNumber} onChange={updateField("phoneNumber")} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {isSaving ? text.saving : text.save}
              </button>

              {successMessage ? (
                <p className="text-sm font-medium text-success">{successMessage}</p>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-danger/25 bg-danger/8 px-4 py-3 text-sm text-danger">
                {errorMessage}
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{text.profileTitle}</h2>
                <p className="mt-1 text-sm text-text-secondary">{text.profileHint}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border bg-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.firstName}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{form.firstName || text.noData}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.lastName}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{form.lastName || text.noData}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.username}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{currentUser?.username || text.noData}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.email}</p>
                <p className="mt-1 break-all text-sm font-semibold text-text-primary">{currentUser?.email || text.noData}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.phoneNumber}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{form.phoneNumber || text.noData}</p>
              </div>
              <div className="rounded-2xl border border-border bg-linear-to-r from-brand-soft/40 to-bg-subtle/35 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{text.accountTitle}</p>
                <p className="mt-1 text-base font-bold text-text-primary">{fullName}</p>
              </div>
            </div>
          </article>
        </form>
      )}
    </section>
  );
}
