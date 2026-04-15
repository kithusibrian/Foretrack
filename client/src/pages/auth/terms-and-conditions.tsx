import { Link } from "react-router-dom";
import { useEffect } from "react";
import { AUTH_ROUTES } from "@/routes/common/routePath";

const TermsAndConditions = () => {
  const lastUpdated = "April 15, 2026";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const readToken = params.get("readToken");

    if (readToken) {
      localStorage.setItem(`foretrack_legal_terms_opened_${readToken}`, "true");
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm sm:p-8">
        <header className="space-y-2 border-b border-border/60 pb-5">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            ForeTrack Terms and Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-muted-foreground">
            These Terms and Conditions govern your use of ForeTrack. By creating
            an account or using ForeTrack, you agree to these terms.
          </p>
        </header>

        <section className="space-y-6 pt-6 text-sm leading-7 text-foreground/90 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Eligibility and Account
            </h2>
            <p>
              You must provide accurate information when registering and keep
              your account details up to date. You are responsible for
              safeguarding your login credentials and all activity under your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Financial Information Disclaimer
            </h2>
            <p>
              ForeTrack helps you organize financial records and generate
              insights. It does not provide legal, tax, accounting, investment,
              or other regulated professional advice. You remain responsible for
              all decisions made using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Acceptable Use
            </h2>
            <p>
              You agree not to misuse the service, attempt unauthorized access,
              interfere with platform security, upload harmful content, or use
              ForeTrack in violation of applicable laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Uploaded Content and AI Extraction
            </h2>
            <p>
              You may upload receipt images and transaction data. You represent
              that you have the right to upload such content. AI-assisted
              extraction may produce incomplete or incorrect results, and you
              should review extracted data before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Availability and Changes
            </h2>
            <p>
              We may update, suspend, or discontinue features at any time,
              including integrations and reporting capabilities. We may also
              modify these terms, and updates will apply from the published
              effective date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, ForeTrack is provided on
              an "as is" and "as available" basis. We are not liable for
              indirect, incidental, special, consequential, or punitive damages,
              including data loss, business interruption, or financial loss
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Termination
            </h2>
            <p>
              We may suspend or terminate accounts that violate these terms or
              pose risk to the platform or other users. You may stop using the
              service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Contact
            </h2>
            <p>
              For questions about these terms, contact the ForeTrack support
              team through your official support channel.
            </p>
          </section>
        </section>

        <footer className="mt-8 border-t border-border/60 pt-5 text-sm text-muted-foreground">
          <p>
            By proceeding with sign up, you acknowledge that you have read and
            understood these Terms and Conditions.
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

export default TermsAndConditions;
