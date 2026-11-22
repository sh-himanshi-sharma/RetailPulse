import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ShoppingBag,
  Truck,
  Sparkles,
  Layers,
  ExternalLink,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Sales Analytics', href: '/sales', icon: TrendingUp },
  { name: 'Customer Analytics', href: '/customers', icon: Users },
  { name: 'Product Analytics', href: '/products', icon: ShoppingBag },
  { name: 'Delivery Analytics', href: '/delivery', icon: Truck },
  { name: 'Business Insights', href: '/insights', icon: Sparkles, badge: '5' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            RetailPulse
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              BI
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Enterprise Analytics</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Dashboards & Reports
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info / Docs Link */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">FastAPI Engine</span>
            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Olist E-commerce Dataset</p>
          <a
            href="http://127.0.0.1:8001/docs"
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Swagger API Docs
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
