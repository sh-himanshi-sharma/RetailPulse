import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  TrendingUp,
  PackageCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import {
  formatNumber,
  formatPercent,
  formatDays,
  formatMonth,
} from '../utils/formatters';
import { KpiCard } from '../components/common/KpiCard';
import { FilterBar } from '../components/common/FilterBar';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const DeliveryAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDeliveryPerformance(activeFilters);
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  const performanceOverTime = data?.performance_over_time || [];
  const stateDelays = data?.delays_by_state || [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        onApplyFilters={(f) => setFilters(f)}
        onResetFilters={() => setFilters({})}
        initialFilters={filters}
        showCategory={false}
        showState={true}
        showDate={true}
      />

      {loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <CardSkeleton count={5} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton height="h-80" />
            <ChartSkeleton height="h-80" />
          </div>
        </>
      )}

      {error && !loading && (
        <ErrorMessage
          title="Could not load delivery analytics"
          message="Failed to retrieve delivery metrics from backend."
          error={error}
          onRetry={() => fetchData(filters)}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Top Row KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Avg Delivery Time"
              value={formatDays(data?.average_delivery_time_days)}
              icon={Clock}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              subtext="Actual order to delivery"
            />
            <KpiCard
              title="Estimated Transit"
              value={formatDays(data?.average_estimated_delivery_days)}
              icon={Calendar}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Target SLA promised"
            />
            <KpiCard
              title="Delivery Buffer"
              value={`${Math.abs(data?.delivery_difference_days || 0).toFixed(1)} days`}
              icon={PackageCheck}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="Delivered ahead of SLA"
            />
            <KpiCard
              title="On-Time Delivery Rate"
              value={formatPercent(data?.ontime_delivery_percentage)}
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="SLA fulfillment rate"
            />
            <KpiCard
              title="Delayed Delivery Rate"
              value={formatPercent(data?.late_delivery_percentage)}
              icon={AlertTriangle}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              subtext="Missed estimated window"
            />
          </div>

          {/* Charts Row: Delivery Time vs Estimated & Monthly Fulfillment Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transit Times: Actual vs Estimated */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Actual vs Estimated Transit Days
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monthly carrier transit speed compared against estimated ETA
                  </p>
                </div>
              </div>

              {performanceOverTime.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tickFormatter={(v) => `${v}d`}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val, name) => [
                          formatDays(val),
                          name === 'avg_delivery_days' ? 'Actual Transit' : 'Estimated Target',
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(value) => (value === 'avg_delivery_days' ? 'Actual Transit (Days)' : 'Estimated Target (Days)')}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_delivery_days"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#4f46e5' }}
                        name="avg_delivery_days"
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_estimated_days"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="avg_estimated_days"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No timeline metrics" description="No timeline records for selected filters." />
              )}
            </div>

            {/* Monthly On-Time Rate */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Monthly SLA Fulfillment Rate (%)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Percentage of orders arriving strictly on or before estimated date
                  </p>
                </div>
              </div>

              {performanceOverTime.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        domain={[60, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val) => [formatPercent(val), 'On-Time SLA']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="ontime_rate" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No rate metrics" description="No SLA rate records available." />
              )}
            </div>
          </div>

          {/* Regional Logistics Benchmark Table (State by State) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Regional State Delivery Benchmarks
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  State-by-state fulfillment transit durations, order volume, and SLA compliance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4 text-right">Orders Delivered</th>
                    <th className="py-3 px-4 text-right">Avg Transit Days</th>
                    <th className="py-3 px-4 text-center">Fulfillment SLA Visual</th>
                    <th className="py-3 px-4 text-right">On-Time %</th>
                    <th className="py-3 px-4 text-right">Late %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stateDelays.map((st) => (
                    <tr key={st.state} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                          {st.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {formatNumber(st.total_orders)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                        {formatDays(st.avg_delivery_days)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-36 mx-auto bg-slate-100 rounded-full h-2 flex overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-l-full"
                            style={{ width: `${Math.min(100, Math.max(0, st.ontime_percentage))}%` }}
                          ></div>
                          <div
                            className="bg-rose-500 h-2 rounded-r-full"
                            style={{ width: `${Math.min(100, Math.max(0, st.late_percentage))}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                        {formatPercent(st.ontime_percentage)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600">
                        {formatPercent(st.late_percentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryAnalytics;
