import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, Server, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const routeTitles = {
  '/': { title: 'Executive Overview', subtitle: 'Real-time GMV, order volume, customer metrics, and fulfillment KPIs' },
  '/sales': { title: 'Sales & Revenue Analytics', subtitle: 'Time-series revenue trends, YoY performance, and category contributions' },
  '/customers': { title: 'Customer & RFM Segmentation', subtitle: 'Customer lifetime value, purchase frequency, and RFM behavioral cohorts' },
  '/products': { title: 'Product & Category Performance', subtitle: 'Category merchandise volume, unit distribution, freight cost, and ratings' },
  '/delivery': { title: 'Logistics & Delivery Performance', subtitle: 'Transit times, SLA compliance, delay rates, and regional fulfillment' },
  '/insights': { title: 'Automated Business Insights', subtitle: 'AI-assisted strategic findings, risk alerts, and operational recommendations' },
};

export const Navbar = ({ onRefresh, isRefreshing = false }) => {
  const location = useLocation();
  const pageInfo = routeTitles[location.pathname] || {
    title: 'RetailPulse Dashboard',
    subtitle: 'Enterprise Business Intelligence Platform',
  };

  const [healthStatus, setHealthStatus] = useState('checking'); // 'healthy' | 'unhealthy' | 'checking'
  const [lastCheck, setLastCheck] = useState(null);

  const checkApiHealth = async () => {
    try {
      setHealthStatus('checking');
      const data = await api.checkHealth();
      if (data && data.status === 'healthy') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('unhealthy');
      }
    } catch {
      setHealthStatus('unhealthy');
    } finally {
      setLastCheck(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{pageInfo.title}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Status Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium hidden md:inline">API:</span>
          {healthStatus === 'healthy' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Connected (8001)
            </span>
          ) : healthStatus === 'checking' ? (
            <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Checking...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium" title="FastAPI not reachable on 8001">
              <AlertCircle className="w-3.5 h-3.5" />
              Disconnected
            </span>
          )}
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh current page data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
