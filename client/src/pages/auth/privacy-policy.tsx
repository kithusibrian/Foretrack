import { Link } from "react-router-dom";
import { useEffect } from "react";
import { AUTH_ROUTES } from "@/routes/common/routePath";

const PrivacyPolicy = () => {
  const lastUpdated = "April 15, 2026";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const readToken = params.get("readToken");

    if (readToken) {
      localStorage.setItem(
        `foretrack_legal_privacy_opened_${readToken}`,
        "true",
      );
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm sm:p-8">
        <header className="space-y-2 border-b border-border/60 pb-5">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            ForeTrack Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-muted-foreground">
            This Privacy Policy explains how ForeTrack collects, uses, stores,
            and protects your information when you use the platform.
          </p>
        </header>

        <section className="space-y-6 pt-6 text-sm leading-7 text-foreground/90 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly, including your name,
              email address, account credentials, profile image, uploaded
              receipts, and transaction records. We may also collect technical
              data such as IP address, browser type, and device metadata needed
              to secure and operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to create and manage your account, deliver
              financial tracking features, process uploaded receipts, generate
              analytics and reports, improve platform reliability, and
              communicate important service notices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. AI and Third-Party Services
            </h2>
            <p>
              Some ForeTrack features use third-party providers for AI
              processing, media storage, and email delivery. Your data is shared
              only as required to provide these features, subject to contractual
              and technical safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Data Retention
            </h2>
            <p>
              We retain account and transaction data for as long as your account
              remains active, and for a limited period afterward as needed for
              compliance, security, and legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Security
            </h2>
            <p>
              We implement reasonable technical and organizational safeguards to
              protect your data. No method of transmission or storage is
              perfectly secure, so we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Your Choices and Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have rights to access,
              correct, or delete your personal information. You may also request
              account deletion by contacting support through your official
              support channel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Cookies and Session Data
            </h2>
            <p>
              ForeTrack may use cookies or similar mechanisms for session
              continuity, security, and product performance. You can control
              some browser-level cookie settings, but disabling them may affect
              service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Policy Updates
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              updates will be reflected by revising the "Last updated" date and,
              where appropriate, by additional notice.
            </p>
          </section>
        </section>

        <footer className="mt-8 border-t border-border/60 pt-5 text-sm text-muted-foreground">
          <p>
            By proceeding with sign up, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>
          <div className="mt-3">
            <Link
              to={AUTH_ROUTES.SIGN_UP}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Back to Sign up
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
};

export default PrivacyPolicy;
