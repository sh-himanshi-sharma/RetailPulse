import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

export const KpiCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend = null, // e.g. { value: 12.5, isPositive: true, label: "vs last month" }
  badge = null,
  tooltip = null,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            {title}
            {tooltip && (
              <span className="group relative cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-20 font-normal normal-case">
                  {tooltip}
                </span>
              </span>
            )}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center font-medium ${
                trend.neutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {trend.neutral ? (
                <Minus className="w-3.5 h-3.5" />
              ) : trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
            <span className="text-slate-400">{trend.label || 'trend'}</span>
          </div>
        ) : (
          <span>{subtext || 'Verified from actual platform records'}</span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
