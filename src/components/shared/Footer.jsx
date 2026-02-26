import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";

export default function Footer() {
  const { t } = useLang("km");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-bg-surface">
      <div className="px-6 py-8 sm:px-10 sm:py-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-bold text-text-primary">{t.brand || "Apsor"}</p>
            <p className="mt-2 max-w-lg text-sm text-text-muted">
              {t.footerTagline || "Find trusted local services in one place."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">
              {t.footerQuickLinks || "Quick Links"}
            </p>
            <div className="mt-3 space-y-2 text-sm text-text-muted">
              <Link to="/" className="block hover:text-brand">
                {t.home || "Home"}
              </Link>
              <Link to="/services" className="block hover:text-brand">
                {t.services || "Services"}
              </Link>
              <Link to="/signin" className="block hover:text-brand">
                {t.signin || "Sign in"}
              </Link>
              <Link to="/signup" className="block hover:text-brand">
                {t.signup || "Sign up"}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">
              {t.footerSupport || "Support"}
            </p>
            <div className="mt-3 space-y-2 text-sm text-text-muted">
              <p>{t.footerContact || "Contact"}: support@apsor.app</p>
              <p>{t.language || "Language"}: KM / EN</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 text-xs text-text-muted">
          {`© ${year} ${t.brand || "Apsor"}. ${t.footerRights || "All rights reserved."}`}
        </div>
      </div>
    </footer>
  );
}
