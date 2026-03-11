import { useEffect, useState } from "react";
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useLang } from "../../i18n/useLang";
import { fetchCurrentUser } from "../../api";
import { getStoredCurrentUser, persistCurrentUser } from "../auth/authStorage";

const UI_TEXT = {
  en: {
    title: "My Profile",
    subtitle: "Manage your personal and account details.",
    profileDetails: "Profile Details",
    accountStatus: "Account Status",
    fullName: "Full name",
    username: "Username",
    email: "Email",
    phone: "Phone number",
    dob: "Date of birth",
    gender: "Gender",
    preferredLanguage: "Preferred language",
    bio: "Bio",
    memberSince: "Member since",
    lastSignin: "Last sign in",
    status: "Status",
    verified: "Verified",
    active: "Active",
    noData: "N/A",
  },
  km: {
    title: "ប្រវត្តិរូបរបស់ខ្ញុំ",
    subtitle: "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងព័ត៌មានគណនី។",
    profileDetails: "ព័ត៌មានប្រវត្តិរូប",
    accountStatus: "ស្ថានភាពគណនី",
    fullName: "ឈ្មោះពេញ",
    username: "ឈ្មោះអ្នកប្រើ",
    email: "អ៊ីមែល",
    phone: "លេខទូរស័ព្ទ",
    dob: "ថ្ងៃខែឆ្នាំកំណើត",
    gender: "ភេទ",
    preferredLanguage: "ភាសាដែលចូលចិត្ត",
    bio: "ប្រវត្តិខ្លី",
    memberSince: "សមាជិកតាំងពី",
    lastSignin: "ចូលគណនីចុងក្រោយ",
    status: "ស្ថានភាព",
    verified: "បានផ្ទៀងផ្ទាត់",
    active: "កំពុងសកម្ម",
    noData: "មិនមានទិន្នន័យ",
  },
};

const PROFILE_DEFAULTS = {
  dob: "1998-04-12",
  gender: "MALE",
  preferredLanguage: "km-KH",
  bio: "Customer profile for MVP testing. Interested in home services and scheduling.",
};

function getLocale(lang) {
  return lang === "km" ? "km-KH" : "en-US";
}

function formatDateTime(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getLocale(lang), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getLocale(lang), {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatGender(value, lang) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "";
  if (lang === "km") {
    if (raw === "MALE") return "ប្រុស";
    if (raw === "FEMALE") return "ស្រី";
  }
  if (raw === "MALE") return "Male";
  if (raw === "FEMALE") return "Female";
  return raw.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "U";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
}

export default function ProfilePage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [currentUser, setCurrentUser] = useState(() => getStoredCurrentUser());
  const signupAt = sessionStorage.getItem("apsor:signupAt");
  const lastSigninAt = sessionStorage.getItem("apsor:lastSigninAt");
  const fullName = String(
    `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`,
  ).trim();
  const username = currentUser?.username || "";
  const email = currentUser?.email || "";
  const phone = currentUser?.phoneNumber || "";
  const dob = currentUser?.dob || PROFILE_DEFAULTS.dob;
  const gender = currentUser?.gender || PROFILE_DEFAULTS.gender;
  const preferredLanguage = currentUser?.preferredLanguage || PROFILE_DEFAULTS.preferredLanguage;
  const bio = currentUser?.bio || PROFILE_DEFAULTS.bio;
  const identityName = fullName || username || "Apsor User";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser();

        if (!isMounted) {
          return;
        }

        setCurrentUser(user);
        persistCurrentUser(user, Boolean(localStorage.getItem("apsor:authSession")));
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-soft to-bg-subtle text-sm font-bold text-brand ring-2 ring-white/70 sm:h-16 sm:w-16 sm:text-base">
            {getInitials(identityName)}
          </div>
          <div className="min-w-0">
            <h1 className="mt-1 truncate text-xl font-bold text-text-primary sm:text-2xl">
              {identityName}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1 truncate text-sm font-medium text-text-secondary">
              <Mail className="h-3.5 w-3.5 text-brand" />
              {email || text.noData}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 truncate text-xs text-text-muted">
              <AtSign className="h-3.5 w-3.5 text-brand" />
              {username || text.noData}
            </p>
            <p className="text-[11px] mt-3 text-text-muted">{text.bio}</p>
            <p className="mt-1 text-sm leading-6 text-text-primary break-words">
              {bio || text.noData}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {text.profileDetails}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.fullName}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <UserRound className="h-3.5 w-3.5 text-brand" />
                {fullName || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.username}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <AtSign className="h-3.5 w-3.5 text-brand" />
                {username || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.email}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <Mail className="h-3.5 w-3.5 text-brand" />
                {email || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.phone}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <Phone className="h-3.5 w-3.5 text-brand" />
                {phone || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.dob}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <CalendarDays className="h-3.5 w-3.5 text-brand" />
                {formatDate(dob, lang) || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
              <p className="text-[11px] text-text-muted">{text.gender}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <UserRound className="h-3.5 w-3.5 text-brand" />
                {formatGender(gender, lang) || text.noData}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5 sm:col-span-2">
              <p className="text-[11px] text-text-muted">{text.preferredLanguage}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                <Globe className="h-3.5 w-3.5 text-brand" />
                {preferredLanguage || text.noData}
              </p>
            </div>

          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {text.accountStatus}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-sm text-text-muted">{text.status}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  {text.active}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-sm text-text-muted">{text.memberSince}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <CalendarDays className="h-3.5 w-3.5 text-brand" />
                  {formatDateTime(signupAt, lang) || text.noData}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-sm text-text-muted">{text.lastSignin}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <BadgeCheck className="h-3.5 w-3.5 text-brand" />
                  {formatDateTime(lastSigninAt, lang) || text.noData}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-sm text-text-muted">{text.verified}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {text.verified}
                </span>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
