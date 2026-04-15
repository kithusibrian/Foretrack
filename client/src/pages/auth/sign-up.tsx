import SignUpForm from "./_component/signup-form";
import { AuthShell } from "./_component/auth-shell";
import {
  BadgeCheck,
  BarChart3,
  Camera,
  Repeat2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const SignUp = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Gemini AI-driven insights",
      description:
        "Turn raw transactions into clear Gemini AI summaries that are easy to act on.",
    },
    {
      icon: Repeat2,
      title: "Recurring automation",
      description:
        "Keep repeated income and expenses organized from the start.",
    },
    {
      icon: BarChart3,
      title: "Monthly reports",
      description:
        "Track spending patterns and progress with a clean report flow.",
    },
    {
      icon: Camera,
      title: "Gemini AI receipt scanning",
      description:
        "Scan receipts in seconds and let Gemini AI convert them into trackable transactions.",
    },
  ];

  const stats = [
    {
      icon: ShieldCheck,
      value: "Protected account",
      label: "Secure by default",
      helper: "Strong passwords, private data, and a safe authentication flow.",
    },
    {
      icon: BadgeCheck,
      value: "Setup in minutes",
      label: "Quick onboarding",
      helper: "Create your workspace and begin tracking without friction.",
    },
    {
      icon: Sparkles,
      value: "Ready for insights",
      label: "Automation-friendly",
      helper: "Get straight to financial clarity once your account is ready.",
    },
  ];

  const testimonials = [
    {
      name: "Jade R.",
      role: "Operations lead",
      quote:
        "The onboarding feels thoughtful. It looks premium from the first screen and stays easy to use.",
      initials: "JR",
    },
    {
      name: "Daniel P.",
      role: "Founder",
      quote:
        "I like that the interface makes finance tracking feel organized, modern, and worth coming back to.",
      initials: "DP",
    },
    {
      name: "Sophia A.",
      role: "Product manager",
      quote:
        "The layout is clean enough for work, but it still has enough personality to feel memorable.",
      initials: "SA",
    },
  ];

  return (
    <AuthShell
      badge="Create your account"
      title="Manage Your Finances with Intelligence."
      description="Join ForeTrack to convert transactions into reports, recurring rules, and smart spending insights with a polished setup flow."
      features={features}
      testimonials={testimonials}
      stats={stats}
      formTag="Get started"
      formTitle="Create your ForeTrack account"
      formDescription="A strong password, a clean profile, and Google sign-in are all you need to begin."
      formNote="No credit card required. Your account is ready for reports, recurring transactions, and Gemini AI-powered summaries."
      accentClassName="bg-indigo-500/10"
    >
      <SignUpForm />
    </AuthShell>
  );
};

export default SignUp;
