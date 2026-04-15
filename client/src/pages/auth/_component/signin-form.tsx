import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useLoginMutation } from "@/features/auth/authAPI";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    login(values)
      .unwrap()
      .then((data) => {
        dispatch(setCredentials(data));
        toast.success("Login successful");
        setTimeout(() => {
          navigate(PROTECTED_ROUTES.OVERVIEW);
        }, 1000);
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to login");
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-5", className)}
        {...props}
      >
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
                    placeholder="brian123@gmail.com"
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
                    className="h-12 rounded-xl border-border/70 bg-background/70 pl-10 shadow-sm transition-shadow focus-visible:shadow-md"
                    placeholder="*******"
                    type="password"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={isLoading}
          type="submit"
          className="h-12 w-full rounded-xl shadow-sm"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          Sign in
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
            Secure session
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            AI insights
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            Receipt scanning
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            Monthly reports
          </span>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_UP}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
