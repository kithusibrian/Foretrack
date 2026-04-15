import type { ReactNode, ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/logo/logo";
import { cn } from "@/lib/utils";
import { ArrowRight, Quote } from "lucide-react";

type IconType = ComponentType<{ className?: string }>;

interface AuthFeature {
  icon: IconType;
  title: string;
  description: string;
}

interface AuthStat {
  icon: IconType;
  value: string;
  label: string;
  helper: string;
}

interface AuthTestimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
}

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  features: AuthFeature[];
  testimonials: AuthTestimonial[];
  stats: AuthStat[];
  formTag: string;
  formTitle: string;
  formDescription: string;
  formNote?: string;
  children: ReactNode;
  accentClassName?: string;
}

export function AuthShell({
  badge,
  title,
  description,
  features,
  testimonials,
  stats,
  formTag,
  formTitle,
  formDescription,
  formNote,
  children,
  accentClassName,
}: AuthShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_26%),radial-gradient(circle_at_88%_14%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_20%_82%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,rgba(244,248,255,0.98),rgba(226,235,251,1))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(99,102,241,0.22),transparent_22%),radial-gradient(circle_at_20%_82%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,rgba(6,10,18,0.98),rgba(13,19,33,1))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 dark:opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.54),transparent_28%,transparent_72%,rgba(255,255,255,0.18))] opacity-70 dark:opacity-10" />
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-[18%] h-64 w-64 rounded-full bg-indigo-400/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-[25%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
        <section className="order-2 relative flex flex-col justify-between border-b border-cyan-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.54))] px-4 py-6 backdrop-blur-2xl dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,13,24,0.78),rgba(11,17,31,0.62))] sm:px-6 lg:order-1 lg:border-b-0 lg:border-r lg:px-10 lg:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.08),transparent_26%),radial-gradient(circle_at_80%_40%,rgba(99,102,241,0.08),transparent_24%)]" />
          <div className="space-y-8 [animation:authRiseIn_600ms_ease-out_both]">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
              <Logo url="/" variant="auth" />
              <Badge
                variant="outline"
                className="hidden rounded-full border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-800 shadow-sm shadow-cyan-500/10 dark:text-cyan-200 sm:inline-flex"
              >
                Premium finance workspace
              </Badge>
            </div>

            <div className="max-w-2xl space-y-4">
              <Badge className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-800 shadow-sm shadow-cyan-500/10 dark:text-cyan-200">
                {badge}
              </Badge>
              <h1 className="max-w-xl text-[2.1rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-3xl border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.48))] p-4 shadow-sm shadow-cyan-500/5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-lg hover:shadow-cyan-500/10 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(15,23,42,0.52))]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-700 ring-1 ring-cyan-500/15 dark:text-cyan-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className={cn(
                    "rounded-3xl border border-indigo-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.5))] p-4 shadow-sm shadow-indigo-500/5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-indigo-400/25 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-indigo-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(15,23,42,0.52))]",
                    index > 0 && "hidden md:block",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-indigo-500/10 p-2 text-indigo-700 ring-1 ring-indigo-500/15 dark:text-indigo-300">
                      <Quote className="h-4 w-4" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm leading-6 text-foreground/90">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-indigo-500/15 ring-1 ring-indigo-500/10">
                          <AvatarFallback className="bg-indigo-500/10 text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.55))] p-5 shadow-xl shadow-cyan-500/5 backdrop-blur-sm [animation:authRiseIn_700ms_ease-out_both] dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.62))]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700/80 dark:text-cyan-300/80">
                  Designed for clarity
                </p>
                <p className="mt-1 text-xl font-semibold">
                  See the whole picture without the noise.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-800 sm:flex dark:text-cyan-200">
                <ArrowRight className="h-3.5 w-3.5" />
                Built for fast decisions
              </div>
            </div>

            <Separator className="my-4 bg-cyan-500/10" />

            <div className="grid gap-3 md:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.58))] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:shadow-md hover:shadow-cyan-500/10 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.52))]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn("rounded-xl p-2 ring-1", accentClassName)}
                      >
                        <Icon className="h-4 w-4 text-cyan-950 dark:text-cyan-50" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{stat.value}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {stat.helper}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:order-2">
          <Card
            className={cn(
              "relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/40 bg-[url('/banner.jpeg')] bg-cover bg-center shadow-[0_34px_90px_-28px_rgba(14,165,233,0.42)] ring-1 ring-cyan-500/15 [animation:authFloatIn_700ms_ease-out_both] dark:border-cyan-300/25",
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84))] dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_38%),linear-gradient(180deg,rgba(10,19,34,0.93),rgba(12,22,38,0.86))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-cyan-100/5" />
            <CardContent className="relative space-y-6 p-5 sm:p-6 md:p-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700/80 dark:text-cyan-300/80">
                  {formTag}
                </p>
                <h2 className="text-[1.65rem] font-semibold tracking-tight text-slate-900 [text-shadow:0_1px_0_rgba(255,255,255,0.35)] dark:text-slate-50 sm:text-[1.85rem] md:text-[2.2rem]">
                  {formTitle}
                </h2>
                <p className="text-sm leading-6 text-slate-800 dark:text-slate-100 sm:text-base sm:leading-7">
                  {formDescription}
                </p>
              </div>

              <Separator className="bg-slate-400/60 dark:bg-cyan-100/20" />

              {children}

              {formNote && (
                <p className="text-sm leading-6 text-slate-800/95 dark:text-slate-100/95">
                  {formNote}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
