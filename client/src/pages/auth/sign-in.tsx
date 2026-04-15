import SignInForm from "./_component/signin-form";
import { AuthShell } from "./_component/auth-shell";
import {
  BarChart3,
  Blocks,
  Camera,
  Repeat2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const SignIn = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Gemini AI summaries",
      description:
        "Quickly understand where your money moved with Gemini AI, without digging through rows.",
    },
    {
      icon: Repeat2,
      title: "Recurring tracking",
      description: "Keep repeat transactions visible and easy to manage.",
    },
    {
      icon: BarChart3,
      title: "Monthly reports",
      description:
        "Get a clean view of performance and spending patterns each month.",
    },
    {
      icon: Camera,
      title: "Gemini AI receipt scanning",
      description:
        "Capture receipts instantly and let Gemini AI turn them into structured transaction records.",
    },
  ];

  const stats = [
    {
      icon: ShieldCheck,
      value: "Secure sign-in",
      label: "Encrypted access",
      helper:
        "Your account stays protected while you move through your dashboard.",
    },
    {
      icon: Blocks,
      value: "One workspace",
      label: "All finance tools",
      helper:
        "Transactions, reports, recurring items, and charts live together.",
    },
    {
      icon: Sparkles,
      value: "Faster insight",
      label: "Less manual work",
      helper: "Focus on decisions instead of hunting for numbers.",
    },
  ];

  const testimonials = [
    {
      name: "Nadia K.",
      role: "Freelance designer",
      quote:
        "The dashboard feels instantly understandable. I can see cash flow, recurring items, and trends without digging.",
      initials: "NK",
    },
    {
      name: "Brian M.",
      role: "Small business owner",
      quote:
        "The monthly reports look polished enough to share, and the AI summaries save me a ton of time.",
      initials: "BM",
    },
    {
      name: "Amina T.",
      role: "Finance analyst",
      quote:
        "It feels like a premium finance workspace rather than another generic tracker.",
      initials: "AT",
    },
  ];

  return (
    <AuthShell
      badge="Welcome Back To ForeTrack"
      title="A calmer, sharper way to manage money."
      description="Sign in to see Gemini AI-powered summaries, recurring transactions, and spending trends in one polished workspace."
      features={features}
      testimonials={testimonials}
      stats={stats}
      formTag="Secure access"
      formTitle="Sign in to ForeTrack"
      formDescription="Use your email or Google account to continue where you left off."
      formNote="Encrypted sessions, responsive dashboards, and Gemini AI-powered summaries are ready when you are."
      accentClassName="bg-cyan-500/10"
    >
      <SignInForm />
    </AuthShell>
  );
};

export default SignIn;
