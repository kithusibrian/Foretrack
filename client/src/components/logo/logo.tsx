import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  url?: string;
  variant?: "default" | "auth";
}

const Logo = ({ url, variant = "default" }: LogoProps) => {
  const isAuthVariant = variant === "auth";

  return (
    <Link
      to={url || PROTECTED_ROUTES.OVERVIEW}
      className={cn("flex items-center gap-2", isAuthVariant && "gap-3")}
    >
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border/40 bg-white/80",
          isAuthVariant
            ? "h-9 w-9 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/25 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
            : "h-7 w-7",
        )}
      >
        <img
          src="/logo.png"
          alt="ForeTrack logo"
          className="h-full w-full object-cover"
        />
      </div>
      <span
        className={cn(
          "font-semibold",
          isAuthVariant
            ? "text-xl tracking-tight sm:text-2xl md:text-[1.9rem]"
            : "text-lg",
        )}
      >
        ForeTrack
      </span>
    </Link>
  );
};

export default Logo;
