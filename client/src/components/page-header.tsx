import { Fragment, ReactNode } from "react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  renderPageHeader?: ReactNode;
}

const PageHeader = ({
  title,
  subtitle,
  rightAction,
  renderPageHeader,
}: PageHeaderProps) => {
  return (
    <div className="w-full bg-[#1a1e2a] px-3 pt-2 pb-10 text-white sm:px-4 sm:pt-3 sm:pb-12 md:px-6 md:pt-4 md:pb-16 lg:px-0 lg:pb-20">
      <div className="mx-auto w-full max-w-[var(--max-width)]">
        {renderPageHeader ? (
          <Fragment>{renderPageHeader}</Fragment>
        ) : (
          <div className="flex w-full flex-col items-start justify-start gap-2 sm:gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
            {(title || subtitle) && (
              <div className="space-y-1">
                {title && (
                  <h2 className="text-xl font-medium sm:text-2xl md:text-3xl lg:text-4xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-white/60 sm:text-sm">{subtitle}</p>
                )}
              </div>
            )}
            {rightAction && rightAction}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
