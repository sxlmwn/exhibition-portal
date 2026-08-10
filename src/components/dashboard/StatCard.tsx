import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subvalue,
  trend,
  icon: Icon,
  iconBgColor = 'bg-sage-100',
  iconColor = 'text-sage-800'
}) => {
  return (
    <div className="glass-card kpi-card stat-tile glass-rise-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between cursor-pointer">
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-sage-800 block mb-1">
            {title}
          </span>
          <h3 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            {value}
          </h3>
          {subvalue && (
            <p className="text-xs text-charcoal-muted mt-1 font-medium">
              {subvalue}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0 shadow-xs border border-sage-200/50`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Bottom row: Trend indicator badge */}
      {trend && (
        <div className="pt-3 border-t border-sage-100 dark:border-white/8 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40' 
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700/40'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
          <span className="text-charcoal-muted font-light">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};
