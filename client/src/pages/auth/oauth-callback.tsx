import { useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;

    const accessToken = searchParams.get("accessToken");
    const expiresAt = searchParams.get("expiresAt");
    const userRaw = searchParams.get("user");
    const reportSettingRaw = searchParams.get("reportSetting");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      toast.error("Google sign-in failed. Please try again.");
      navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
      return;
    }

    if (!accessToken || !expiresAt || !userRaw) {
      toast.error("Google authentication failed. Please try again.");
      navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      const reportSetting = reportSettingRaw
        ? JSON.parse(reportSettingRaw)
        : null;

      dispatch(
        setCredentials({
          accessToken,
          expiresAt: Number(expiresAt),
          user,
          reportSetting,
        }),
      );

      toast.success("Signed in with Google successfully");
      navigate(PROTECTED_ROUTES.OVERVIEW, { replace: true });
    } catch (_error) {
      toast.error("Unable to complete Google sign-in. Please try again.");
      navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        Finalizing Google sign-in...
      </div>
    </div>
  );
};

export default OAuthCallback;
