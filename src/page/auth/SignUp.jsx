import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Globe2,
  ImagePlus,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthInput from "../../components/auth/AuthInput";
import { createCustomer, signUp } from "../../api";

const PROFILE_IMAGE_MAX_SIZE_MB = 3;
const BIO_MAX_LENGTH = 220;

const UI_TEXT = {
  en: {
    title: "Create Account",
    subtitle: "Sign up to start booking trusted local services.",
    stepAccount: "Account",
    stepProfile: "Profile",
    username: "Username",
    usernamePlaceholder: "sok.sitha2",
    email: "Email",
    emailPlaceholder: "sok.sitha@example.com",
    firstName: "First name",
    firstNamePlaceholder: "Sok",
    lastName: "Last name",
    lastNamePlaceholder: "Sitha",
    password: "Password",
    passwordPlaceholder: "P@ssw0rd123!",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your password",
    phoneNumber: "Phone number",
    phoneNumberPlaceholder: "0153455543",
    dob: "Date of birth",
    gender: "Gender",
    preferredLanguage: "Preferred language",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    genderMale: "Male",
    genderFemale: "Female",
    profileImage: "Profile image",
    uploadProfile: "Upload profile image",
    removePhoto: "Remove photo",
    imageHint: "JPG, PNG, WEBP up to 3MB",
    requiredFields: "All account fields are required.",
    requiredProfileFields: "Please complete profile details (DOB, gender, language, bio).",
    invalidUsername: "Username must be at least 3 characters and only use letters, numbers, dot, underscore, or hyphen.",
    invalidEmail: "Please enter a valid email address.",
    weakPassword: "Password must be at least 8 characters and include upper, lower, number, and symbol.",
    mismatchPassword: "Password and confirm password do not match.",
    invalidPhone: "Please enter a valid phone number.",
    invalidDob: "Please enter a valid date of birth.",
    invalidImageType: "Only image files are allowed.",
    invalidImageSize: "Image size must be 3MB or less.",
    signUpFailed: "Unable to create your account right now.",
    creatingAccount: "Creating account...",
    nextStep: "Next",
    backStep: "Back",
    signUpButton: "Sign up",
    haveAccount: "Already have an account?",
    backHome: "Back to Home",
  },
  km: {
    title: "បង្កើតគណនី",
    subtitle: "ចុះឈ្មោះដើម្បីចាប់ផ្តើមកក់សេវាកម្មដែលអាចទុកចិត្តបាន។",
    stepAccount: "ព័ត៌មានគណនី",
    stepProfile: "ព័ត៌មានប្រវត្តិរូប",
    username: "ឈ្មោះអ្នកប្រើប្រាស់",
    usernamePlaceholder: "sok.sitha2",
    email: "អ៊ីមែល",
    emailPlaceholder: "sok.sitha@example.com",
    firstName: "នាមខ្លួន",
    firstNamePlaceholder: "Sok",
    lastName: "នាមត្រកូល",
    lastNamePlaceholder: "Sitha",
    password: "ពាក្យសម្ងាត់",
    passwordPlaceholder: "P@ssw0rd123!",
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
    confirmPasswordPlaceholder: "បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត",
    phoneNumber: "លេខទូរស័ព្ទ",
    phoneNumberPlaceholder: "015407184",
    dob: "ថ្ងៃខែឆ្នាំកំណើត",
    gender: "ភេទ",
    preferredLanguage: "ភាសាដែលចូលចិត្ត",
    bio: "ប្រវត្តិខ្លី",
    bioPlaceholder: "សរសេរព័ត៌មានខ្លីអំពីអ្នក...",
    genderMale: "ប្រុស",
    genderFemale: "ស្រី",
    profileImage: "រូបប្រវត្តិរូប",
    uploadProfile: "បញ្ចូលរូបប្រវត្តិរូប",
    removePhoto: "លុបរូប",
    imageHint: "JPG, PNG, WEBP ទំហំតិចជាង 3MB",
    requiredFields: "សូមបំពេញព័ត៌មានគណនីទាំងអស់។",
    requiredProfileFields: "សូមបំពេញព័ត៌មានប្រវត្តិរូប (DOB, ភេទ, ភាសា, ប្រវត្តិខ្លី)។",
    invalidUsername: "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច 3 តួអក្សរ ហើយប្រើបានតែអក្សរ លេខ . _ - ប៉ុណ្ណោះ។",
    invalidEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យត្រឹមត្រូវ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 8 តួអក្សរ និងមានអក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា។",
    mismatchPassword: "ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់ មិនត្រូវគ្នា។",
    invalidPhone: "សូមបញ្ចូលលេខទូរស័ព្ទឱ្យត្រឹមត្រូវ។",
    invalidDob: "សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើតឱ្យត្រឹមត្រូវ។",
    invalidImageType: "អាចបញ្ចូលបានតែឯកសាររូបភាពប៉ុណ្ណោះ។",
    invalidImageSize: "ទំហំរូបភាពត្រូវតិចជាង ឬស្មើ 3MB។",
    signUpFailed: "មិនអាចបង្កើតគណនីបានទេ នៅពេលនេះ។",
    creatingAccount: "កំពុងបង្កើតគណនី...",
    nextStep: "បន្ទាប់",
    backStep: "ត្រឡប់",
    signUpButton: "ចុះឈ្មោះ",
    haveAccount: "មានគណនីរួចហើយ?",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
  },
};

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isUsername(value) {
  return /^[a-zA-Z0-9._-]{3,}$/.test(String(value || "").trim());
}

function isStrongPassword(value) {
  const safeValue = String(value || "");
  return (
    safeValue.length >= 8
    && /[a-z]/.test(safeValue)
    && /[A-Z]/.test(safeValue)
    && /\d/.test(safeValue)
    && /[^A-Za-z0-9]/.test(safeValue)
  );
}

function isPhone(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  return /^0\d{7,9}$/.test(normalized);
}

function normalizePhone(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  if (normalized.startsWith("+855")) return `0${normalized.slice(4)}`;
  if (normalized.startsWith("855")) return `0${normalized.slice(3)}`;
  return normalized;
}

function isValidDob(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date <= todayOnly;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [dob, setDob] = useState("1998-04-12");
  const [gender, setGender] = useState("MALE");
  const [preferredLanguage, setPreferredLanguage] = useState("km-KH");
  const [bio, setBio] = useState("Customer profile for MVP testing. Interested in home services and scheduling.");
  const [profileImageDataUrl, setProfileImageDataUrl] = useState("");
  const [profileImageName, setProfileImageName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayIso = new Date().toISOString().slice(0, 10);

  const validateStepOne = () => {
    const safeUsername = String(username || "").trim();
    const safeEmail = String(email || "").trim();
    const safeFirstName = String(firstName || "").trim();
    const safeLastName = String(lastName || "").trim();
    const safePassword = String(password || "");
    const safeConfirmPassword = String(confirmPassword || "");
    const safePhoneNumber = normalizePhone(phoneNumber);

    if (
      !safeUsername
      || !safeEmail
      || !safeFirstName
      || !safeLastName
      || !safePassword
      || !safeConfirmPassword
      || !safePhoneNumber
    ) {
      setError(text.requiredFields);
      return null;
    }

    if (!isUsername(safeUsername)) {
      setError(text.invalidUsername);
      return null;
    }

    if (!isEmail(safeEmail)) {
      setError(text.invalidEmail);
      return null;
    }

    if (!isStrongPassword(safePassword)) {
      setError(text.weakPassword);
      return null;
    }

    if (safePassword !== safeConfirmPassword) {
      setError(text.mismatchPassword);
      return null;
    }

    if (!isPhone(safePhoneNumber)) {
      setError(text.invalidPhone);
      return null;
    }

    return {
      username: safeUsername,
      email: safeEmail,
      firstName: safeFirstName,
      lastName: safeLastName,
      password: safePassword,
      phoneNumber: safePhoneNumber,
    };
  };

  const goToProfileStep = () => {
    const stepOneValues = validateStepOne();
    if (!stepOneValues) return;

    setError("");
    setStep(2);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step === 1) {
      goToProfileStep();
      return;
    }

    const stepOneValues = validateStepOne();
    if (!stepOneValues) return;

    const safeDob = String(dob || "").trim();
    const safeGender = String(gender || "").trim();
    const safePreferredLanguage = String(preferredLanguage || "").trim();
    const safeBio = String(bio || "").trim().slice(0, BIO_MAX_LENGTH);

    if (!safeDob || !safeGender || !safePreferredLanguage || !safeBio) {
      setError(text.requiredProfileFields);
      return;
    }

    if (!isValidDob(safeDob)) {
      setError(text.invalidDob);
      return;
    }

    const signUpPayload = {
      username: stepOneValues.username,
      email: stepOneValues.email,
      firstName: stepOneValues.firstName,
      lastName: stepOneValues.lastName,
      password: stepOneValues.password,
      phoneNumber: stepOneValues.phoneNumber.startsWith("0")
        ? `+855${stepOneValues.phoneNumber.slice(1)}`
        : stepOneValues.phoneNumber,
    };

    const customerPayload = {
      dob: safeDob,
      gender: safeGender,
      preferredLanguage: safePreferredLanguage,
      bio: safeBio,
      onboardingCompleted: false,
    };

    setError("");
    setIsSubmitting(true);

    try {
      await signUp(signUpPayload);
      await createCustomer(customerPayload);

      sessionStorage.setItem("apsor:signupAt", new Date().toISOString());
      sessionStorage.setItem("apsor:lastSigninEmail", stepOneValues.email);
      navigate("/signin", { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
          || requestError?.response?.data?.error
          || text.signUpFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center bg-bg-app px-6 py-8 sm:px-10 md:px-20 lg:px-28 xl:px-36">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2">
        <section className="p-5 sm:p-7 md:p-8">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo-preview.png"
              alt="Apsor Logo"
              className="h-12 w-auto object-contain sm:h-14"
            />
            <h2 className="mt-3 text-2xl font-bold text-text-primary">{text.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-center text-[11px] font-semibold">
            <div
              className={`rounded-md px-2 py-2 transition ${
                step === 1 ? "bg-brand-soft text-brand" : "bg-bg-subtle text-text-muted"
              }`}
            >
              {`1. ${text.stepAccount}`}
            </div>
            <div
              className={`rounded-md px-2 py-2 transition ${
                step === 2 ? "bg-brand-soft text-brand" : "bg-bg-subtle text-text-muted"
              }`}
            >
              {`2. ${text.stepProfile}`}
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            {step === 1 ? (
              <>
                <AuthInput
                  name="username"
                  label={text.username}
                  icon={User}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={text.usernamePlaceholder}
                  autoComplete="username"
                  required
                  requiredMessage={text.requiredFields}
                  validator={(value) => (!value.trim() || isUsername(value) ? "" : text.invalidUsername)}
                />

                <AuthInput
                  name="email"
                  label={text.email}
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={text.emailPlaceholder}
                  autoComplete="email"
                  required
                  requiredMessage={text.requiredFields}
                  validator={(value) => (!value.trim() || isEmail(value) ? "" : text.invalidEmail)}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AuthInput
                    name="firstName"
                    label={text.firstName}
                    icon={User}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={text.firstNamePlaceholder}
                    autoComplete="given-name"
                    required
                    requiredMessage={text.requiredFields}
                  />

                  <AuthInput
                    name="lastName"
                    label={text.lastName}
                    icon={User}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={text.lastNamePlaceholder}
                    autoComplete="family-name"
                    required
                    requiredMessage={text.requiredFields}
                  />
                </div>

                <AuthInput
                  name="password"
                  label={text.password}
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                  autoComplete="new-password"
                  required
                  requiredMessage={text.requiredFields}
                  validator={(value) => (!value || isStrongPassword(value) ? "" : text.weakPassword)}
                  showToggle
                  isVisible={showPassword}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                  toggleLabels={{
                    show: "Show password",
                    hide: "Hide password",
                  }}
                />

                <AuthInput
                  name="confirmPassword"
                  label={text.confirmPassword}
                  icon={Lock}
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={text.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  required
                  requiredMessage={text.requiredFields}
                  validator={(value) => (!value || value === password ? "" : text.mismatchPassword)}
                  showToggle
                  isVisible={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
                  toggleLabels={{
                    show: "Show confirm password",
                    hide: "Hide confirm password",
                  }}
                />

                <AuthInput
                  name="phoneNumber"
                  label={text.phoneNumber}
                  icon={Phone}
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder={text.phoneNumberPlaceholder}
                  autoComplete="tel"
                  required
                  requiredMessage={text.requiredFields}
                  validator={(value) => {
                    if (!value.trim()) return "";
                    return isPhone(normalizePhone(value)) ? "" : text.invalidPhone;
                  }}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-bg-app p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                    {text.profileImage}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-bg-surface">
                      {profileImageDataUrl ? (
                        <img src={profileImageDataUrl} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-text-muted" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand">
                        <ImagePlus className="h-3.5 w-3.5" />
                        {text.uploadProfile}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-1 truncate text-[11px] text-text-muted">
                        {profileImageName || text.imageHint}
                      </p>

                      {profileImageDataUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImageDataUrl("");
                            setProfileImageName("");
                          }}
                          className="mt-1 text-[11px] font-semibold text-danger transition hover:opacity-90"
                        >
                          {text.removePhoto}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AuthInput
                    name="dob"
                    label={text.dob}
                    icon={CalendarDays}
                    type="date"
                    value={dob}
                    onChange={(event) => setDob(event.target.value)}
                    max={todayIso}
                    required
                    requiredMessage={text.requiredProfileFields}
                    validator={(value) => (!value || isValidDob(value) ? "" : text.invalidDob)}
                  />

                  <AuthInput
                    name="gender"
                    as="select"
                    label={text.gender}
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    required
                    requiredMessage={text.requiredProfileFields}
                  >
                      <option value="MALE">{text.genderMale}</option>
                      <option value="FEMALE">{text.genderFemale}</option>
                  </AuthInput>
                </div>

                <AuthInput
                  name="preferredLanguage"
                  as="select"
                  label={text.preferredLanguage}
                  icon={Globe2}
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  required
                  requiredMessage={text.requiredProfileFields}
                >
                      <option value="km-KH">km-KH</option>
                      <option value="en-US">en-US</option>
                </AuthInput>

                <AuthInput
                  name="bio"
                  as="textarea"
                  label={text.bio}
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
                  placeholder={text.bioPlaceholder}
                  rows={4}
                  required
                  requiredMessage={text.requiredProfileFields}
                />
                  <p className="mt-1 text-right text-[11px] text-text-muted">
                    {`${bio.length}/${BIO_MAX_LENGTH}`}
                  </p>
              </>
            )}

            {error ? (
              <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
              >
                {text.nextStep}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {text.backStep}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
                >
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting ? text.creatingAccount : text.signUpButton}
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
            <p>
              {text.haveAccount}{" "}
              <Link to="/signin" className="font-semibold text-brand hover:text-brand-hover">
                {t.signin || "Sign in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
