import { FileSearch, LucideIcon } from "lucide-react";
import * as React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  className = "",
}) => {
  const Icon = icon || FileSearch;
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] w-full ${className}`}
    >
      {Icon && (
        <div className="bg-slate-100 p-2 sm:p-3 md:p-4 rounded-full mb-3 sm:mb-4 md:mb-6">
          <Icon className="w-6 h-6 text-muted-foreground sm:w-7 sm:h-7 md:w-8 md:h-8" />
        </div>
      )}
      <h3 className="mb-1 text-base font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center mb-4">
        {description}
      </p>
      <div className="h-1 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full" />
    </div>
  );
};
