import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Loader,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ExternalLink,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/routes/common/routePath";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegisterMutation } from "@/features/auth/authAPI";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Must include at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Must include at least one lowercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Must include at least one number",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Must include at least one special character",
    })
    .refine((val) => !/\s/.test(val), {
      message: "Must not contain spaces",
    }),
});

type FormValues = z.infer<typeof schema>;

const SignUpForm = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [hasOpenedTerms, setHasOpenedTerms] = useState(false);
  const [hasOpenedPrivacy, setHasOpenedPrivacy] = useState(false);
  const [hasAgreedToLegal, setHasAgreedToLegal] = useState(false);
  const [legalReadToken] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const hasOpenedAllLegalDocs = hasOpenedTerms && hasOpenedPrivacy;
  const termsHref = `${AUTH_ROUTES.TERMS_AND_CONDITIONS}?readToken=${legalReadToken}`;
  const privacyHref = `${AUTH_ROUTES.PRIVACY_POLICY}?readToken=${legalReadToken}`;

  useEffect(() => {
    const syncLegalReadState = () => {
      setHasOpenedTerms(
        localStorage.getItem(
          `foretrack_legal_terms_opened_${legalReadToken}`,
        ) === "true",
      );
      setHasOpenedPrivacy(
        localStorage.getItem(
          `foretrack_legal_privacy_opened_${legalReadToken}`,
        ) === "true",
      );
    };

    syncLegalReadState();

    window.addEventListener("focus", syncLegalReadState);
    document.addEventListener("visibilitychange", syncLegalReadState);
    window.addEventListener("storage", syncLegalReadState);

    return () => {
      window.removeEventListener("focus", syncLegalReadState);
      document.removeEventListener("visibilitychange", syncLegalReadState);
      window.removeEventListener("storage", syncLegalReadState);
    };
  }, [legalReadToken]);

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    if (!hasOpenedAllLegalDocs) {
      toast.error(
        "Please open and read the Terms and Conditions and Privacy Policy before continuing.",
      );
      return;
    }

    if (!hasAgreedToLegal) {
      toast.error("Please agree to the Terms and Conditions to continue.");
      return;
    }

    register(values)
      .unwrap()
      .then(() => {
        form.reset();
        setHasAgreedToLegal(false);
        toast.success("Sign up successful");
        navigate(AUTH_ROUTES.SIGN_IN);
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to sign up");
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium text-foreground">
                Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-xl border-border/70 bg-background/70 pl-10 shadow-sm transition-shadow focus-visible:shadow-md"
                    placeholder="John Doe"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium text-foreground">
                Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-xl border-border/70 bg-background/70 pl-10 shadow-sm transition-shadow focus-visible:shadow-md"
                    placeholder="m@example.com"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium text-foreground">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    className="h-12 rounded-xl border-border/70 bg-background/70 pl-10 shadow-sm transition-shadow focus-visible:shadow-md"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                  8+ characters
                </span>
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                  At Least 1 Uppercase Letter
                </span>
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                  Number
                </span>
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                  Symbol
                </span>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-3.5">
          <p className="text-xs text-muted-foreground">
            Please review both documents before agreeing.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href={termsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
            >
              Terms and Conditions
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <a
              href={privacyHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
            >
              Privacy Policy
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5">
            <Checkbox
              id="legalAgreement"
              checked={hasAgreedToLegal}
              disabled={!hasOpenedAllLegalDocs}
              onCheckedChange={(checked) =>
                setHasAgreedToLegal(Boolean(checked))
              }
              className="mt-0.5"
            />

            <label
              htmlFor="legalAgreement"
              className="text-sm leading-6 text-foreground"
            >
              By signing up, I agree to the Terms and Conditions of ForeTrack
              and acknowledge the Privacy Policy.
            </label>
          </div>

          {!hasOpenedAllLegalDocs && (
            <p className="text-xs text-amber-600">
              Open both documents first to enable agreement.
            </p>
          )}
        </div>

        <Button
          disabled={isLoading || !hasOpenedAllLegalDocs || !hasAgreedToLegal}
          type="submit"
          className="h-12 w-full rounded-xl shadow-sm"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          Create account
        </Button>

        <div className="relative py-1 text-center text-xs uppercase tracking-[0.24em] text-muted-foreground after:absolute after:inset-x-0 after:top-1/2 after:-z-0 after:border-t after:border-border/70">
          <span className="relative z-10 bg-[var(--bg-color)] px-3 dark:bg-background">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-border/70 bg-background/70 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-background"
          onClick={handleGoogleSignIn}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M21.35 11.1H12v2.98h5.36c-.23 1.52-1.09 2.81-2.32 3.67v2.44h3.75c2.2-2.02 3.47-5 3.47-8.39 0-.56-.05-1.12-.16-1.66z"
              fill="#4285F4"
            />
            <path
              d="M12 21c2.7 0 4.97-.9 6.63-2.44l-3.75-2.44c-1.04.7-2.36 1.11-3.88 1.11-2.98 0-5.5-2.01-6.4-4.72H.74v2.52A9.99 9.99 0 0 0 12 21z"
              fill="#34A853"
            />
            <path
              d="M5.6 12.51a6.08 6.08 0 0 1 0-3.88V6.11H.74a9.99 9.99 0 0 0 0 8.92l3.86-2.52z"
              fill="#FBBC05"
            />
            <path
              d="M12 6.77c1.47 0 2.79.5 3.82 1.49l2.86-2.86C16.96 3.8 14.7 3 12 3A9.99 9.99 0 0 0 .74 6.11l3.86 2.52c.9-2.71 3.42-4.72 6.4-4.72z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Private by design
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            Import-ready
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            Receipt scanning
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            Monthly reports
          </span>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_IN}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
