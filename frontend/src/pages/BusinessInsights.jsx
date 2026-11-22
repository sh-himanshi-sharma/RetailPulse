import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const SEVERITY_CONFIG = {
  positive: {
    label: 'Growth Driver',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    borderClass: 'border-l-4 border-l-emerald-500',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgLight: 'bg-emerald-500/5',
  },
  action_required: {
    label: 'Action Required',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
    borderClass: 'border-l-4 border-l-rose-500',
    icon: AlertOctagon,
    iconColor: 'text-rose-500',
    bgLight: 'bg-rose-500/5',
  },
  warning: {
    label: 'Risk Warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    borderClass: 'border-l-4 border-l-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bgLight: 'bg-amber-500/5',
  },
  info: {
    label: 'Market Trend',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    borderClass: 'border-l-4 border-l-indigo-500',
    icon: Info,
    iconColor: 'text-indigo-500',
    bgLight: 'bg-indigo-500/5',
  },
};

export const BusinessInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | severity
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBusinessInsights();
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyRecommendation = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insights = data?.insights || [];
  const filteredInsights = activeFilter === 'all'
    ? insights
    : insights.filter((i) => i.severity === activeFilter);

  // Severity counts
  const severityCounts = insights.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 shadow-sm">
          <LoadingSpinner
            message="Synthesizing Strategic Business Insights..."
            subtext="Running algorithmic correlations across GMV, fulfillment SLAs, and RFM matrices"
          />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <ErrorMessage
          title="Could not load business insights"
          message="Failed to retrieve automated executive insights from the analytics service."
          error={error}
          onRetry={fetchData}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {data.summary_headline}
                    </h2>
                    <p className="text-xs text-indigo-200 mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Generated at: {data.generated_at} • Continuous Intelligence Feed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/60 border border-indigo-400/40 text-white">
                    {insights.length} Strategic Findings
                  </span>
                </div>
              </div>
            </div>
            {/* Subtle background glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none"></div>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Insights ({insights.length})
            </button>
            {Object.keys(SEVERITY_CONFIG).map((sev) => {
              const cfg = SEVERITY_CONFIG[sev];
              const count = severityCounts[sev] || 0;
              const Icon = cfg.icon;
              return (
                <button
                  key={sev}
                  onClick={() => setActiveFilter(sev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === sev
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeFilter === sev ? 'text-white' : cfg.iconColor}`} />
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Insights List */}
          {filteredInsights.length > 0 ? (
            <div className="space-y-4">
              {filteredInsights.map((item) => {
                const config = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info;
                const Icon = config.icon;
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 ${config.borderClass} hover:shadow-md transition-all duration-200`}
                  >
                    {/* Top Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {item.category}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>

                    {/* Observation */}
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {item.observation}
                    </p>

                    {/* Data Evidence Callout */}
                    <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-start gap-3">
                      <div className="p-1 bg-white border border-slate-200 rounded text-slate-600 font-mono text-[10px] font-bold uppercase mt-0.5">
                        Data
                      </div>
                      <div className="text-slate-700 font-medium leading-relaxed">
                        <span className="text-slate-500 font-semibold mr-1">Empirical Evidence:</span>
                        {item.data_evidence}
                      </div>
                    </div>

                    {/* Actionable Recommendation Card */}
                    <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                          Recommended Action for Leadership:
                        </span>
                        <button
                          onClick={() => handleCopyRecommendation(item.id, item.recommendation)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-100/60 transition-colors"
                          title="Copy recommendation"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-medium text-indigo-950 leading-relaxed">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No insights match filter"
              description="No business findings match the selected severity category."
              onAction={() => setActiveFilter('all')}
              actionLabel="View All Insights"
            />
          )}
        </>
      )}
    </div>
  );
};

export default BusinessInsights;
