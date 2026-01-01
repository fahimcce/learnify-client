import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  gradient = "from-blue-500 to-cyan-500",
}: DashboardStatCardProps) {
  return (
    <DashboardCard className="relative overflow-hidden group hover:scale-105">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity`}></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-black text-foreground mt-2">{value}</p>
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-3 pt-3 border-t border-border">
            <span
              className={cn(
                "text-sm font-semibold",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.isPositive ? "↗" : "↘"} {trend.value}
            </span>
            <span className="text-sm text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
