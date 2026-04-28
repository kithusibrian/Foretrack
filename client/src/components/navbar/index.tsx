import { useEffect, useMemo, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { cn } from "@/lib/utils";
import Logo from "../logo/logo";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { UserNav } from "./user-nav";
import LogoutDialog from "./logout-dialog";
import { useTypedSelector } from "@/app/hook";
import { useGetBudgetProgressQuery } from "@/features/budget/budgetAPI";

const BUDGET_ALERT_THRESHOLD = 80;

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useTypedSelector((state) => state.auth);
  const userId = user?.id || user?.email || "anonymous";
  const budgetAlertSeenStorageKey = `foretrack_budget_alert_seen_${userId}`;

  const now = new Date();
  const { data: budgetProgress } = useGetBudgetProgressQuery({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    alertThreshold: BUDGET_ALERT_THRESHOLD,
  });
  const hasBudgetAlerts = !!budgetProgress?.data?.summary?.hasAlerts;

  const currentBudgetAlertSignature = useMemo(() => {
    const alerts = budgetProgress?.data?.alerts || [];
    const period = budgetProgress?.data?.period;

    if (alerts.length === 0 || !period) return "";

    const normalizedAlerts = alerts
      .map(
        (alert) =>
          `${alert.id}:${alert.status}:${Number(alert.usedPercentage).toFixed(1)}`,
      )
      .sort()
      .join("|");

    return `${period.year}-${period.month}:${normalizedAlerts}`;
  }, [budgetProgress]);

  const [viewedBudgetAlertSignature, setViewedBudgetAlertSignature] =
    useState("");

  useEffect(() => {
    const storedSignature =
      localStorage.getItem(budgetAlertSeenStorageKey) || "";
    setViewedBudgetAlertSignature(storedSignature);
  }, [budgetAlertSeenStorageKey]);

  useEffect(() => {
    if (
      pathname === PROTECTED_ROUTES.BUDGETS &&
      currentBudgetAlertSignature &&
      currentBudgetAlertSignature !== viewedBudgetAlertSignature
    ) {
      localStorage.setItem(
        budgetAlertSeenStorageKey,
        currentBudgetAlertSignature,
      );
      setViewedBudgetAlertSignature(currentBudgetAlertSignature);
    }
  }, [
    pathname,
    currentBudgetAlertSignature,
    viewedBudgetAlertSignature,
    budgetAlertSeenStorageKey,
  ]);

  const hasUnseenBudgetAlerts =
    hasBudgetAlerts &&
    !!currentBudgetAlertSignature &&
    currentBudgetAlertSignature !== viewedBudgetAlertSignature;
  const budgetAlertCount = budgetProgress?.data?.alerts?.length || 0;
  const budgetAlertCountLabel =
    budgetAlertCount > 99 ? "99+" : String(budgetAlertCount);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const routes = [
    {
      href: PROTECTED_ROUTES.OVERVIEW,
      label: "Overview",
    },
    {
      href: PROTECTED_ROUTES.TRANSACTIONS,
      label: "Transactions",
    },
      {
        href: PROTECTED_ROUTES.GOALS,
        label: "Goals",
      },
    {
      href: PROTECTED_ROUTES.BUDGETS,
      label: "Budgets",
    },
    {
      href: PROTECTED_ROUTES.REPORTS,
      label: "Reports",
    },
    {
      href: PROTECTED_ROUTES.SETTINGS,
      label: "Settings",
    },
  ];

  return (
    <>
      <header
        className={cn(
          "w-full bg-[var(--secondary-dark-color)] px-3 py-3 pb-3 text-white sm:px-4 md:px-6 lg:px-14",
          pathname === PROTECTED_ROUTES.OVERVIEW && "!pb-3",
        )}
      >
        <div className="w-full flex h-14 max-w-[var(--max-width)] items-center mx-auto">
          <div className="w-full flex items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex !cursor-pointer !bg-white/10 !text-white hover:bg-white/10 md:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Logo />
            </div>

            {/* Navigation*/}
            <nav className="hidden items-center gap-x-2 overflow-x-auto md:flex">
              {routes?.map((route) => (
                <Button
                  key={`desktop-${route.href}`}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    `w-full lg:w-auto font-normal py-4.5
                     hover:text-white border-none
                     text-white/60 focus:bg-white/30
                     transtion !bg-transparent !text-[14.5px]
                     `,
                    pathname === route.href && "text-white",
                  )}
                  asChild
                >
                  <NavLink
                    to={route.href}
                    className="inline-flex items-center gap-1.5"
                  >
                    {route.label}
                    {route.href === PROTECTED_ROUTES.BUDGETS &&
                      hasUnseenBudgetAlerts && (
                        <span className="inline-flex items-center gap-1">
                          <Bell className="h-3.5 w-3.5 text-amber-300" />
                          <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-semibold leading-4 text-black">
                            {budgetAlertCountLabel}
                          </span>
                        </span>
                      )}
                  </NavLink>
                </Button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetContent side="left" className="w-[85vw] max-w-xs bg-white">
                <nav className="flex flex-col gap-y-2 pt-9">
                  {routes?.map((route) => (
                    <Button
                      key={`mobile-${route.href}`}
                      size="sm"
                      variant="ghost"
                      className={cn(
                        `w-full font-normal py-4.5
                       hover:bg-white/10 hover:text-black border-none
                       text-black/70 focus:bg-white/30
                       transtion !bg-transparent justify-start`,
                        pathname === route.href && "!bg-black/10 text-black",
                      )}
                      asChild
                    >
                      <NavLink
                        to={route.href}
                        className="inline-flex items-center gap-1.5"
                      >
                        {route.label}
                        {route.href === PROTECTED_ROUTES.BUDGETS &&
                          hasUnseenBudgetAlerts && (
                            <span className="inline-flex items-center gap-1">
                              <Bell className="h-3.5 w-3.5 text-amber-500" />
                              <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-4 text-white">
                                {budgetAlertCountLabel}
                              </span>
                            </span>
                          )}
                      </NavLink>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* {} */}
            {/* Right side - User actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <UserNav
                userName={user?.name || ""}
                profilePicture={user?.profilePicture || ""}
                onLogout={() => setIsLogoutDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        setIsOpen={setIsLogoutDialogOpen}
      />
    </>
  );
};

export default Navbar;
