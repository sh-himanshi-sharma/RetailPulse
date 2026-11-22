import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import {
  formatCurrency,
  formatCompactCurrency,
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

const STATUS_COLORS = {
  delivered: '#10b981',
  shipped: '#3b82f6',
  processing: '#8b5cf6',
  invoiced: '#06b6d4',
  canceled: '#f43f5e',
  unavailable: '#f59e0b',
  created: '#94a3b8',
  approved: '#6366f1',
};

const PALETTE = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

export const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOverview(activeFilters);
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

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const kpis = data?.kpis;
  const monthlyTrend = data?.monthly_revenue_trend || [];
  const topCategories = data?.top_categories || [];
  const orderStatusDist = data?.order_status_distribution || [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        initialFilters={filters}
        showCategory={true}
        showState={true}
        showDate={true}
      />

      {/* Loading Skeleton */}
      {loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CardSkeleton count={4} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartSkeleton height="h-96" />
            </div>
            <div>
              <ChartSkeleton height="h-96" />
            </div>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && !loading && (
        <ErrorMessage
          title="Could not load dashboard overview"
          message="Failed to retrieve executive analytics data. Please ensure the backend is running."
          error={error}
          onRetry={() => fetchData(filters)}
        />
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* Top Row KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Total GMV Revenue"
              value={formatCurrency(kpis?.total_revenue)}
              icon={DollarSign}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              subtext="Sum of product merchandise value"
              tooltip="Gross Merchandise Value (GMV) of completed orders"
            />
            <KpiCard
              title="Total Orders"
              value={formatNumber(kpis?.total_orders)}
              icon={ShoppingCart}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Processed purchase transactions"
            />
            <KpiCard
              title="Average Order Value"
              value={formatCurrency(kpis?.average_order_value)}
              icon={CreditCard}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              subtext="Revenue per valid customer order"
            />
            <KpiCard
              title="Total Customers"
              value={formatNumber(kpis?.total_customers)}
              icon={Users}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="Unique verified purchasers"
            />
          </div>

          {/* Secondary KPIs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On-Time Delivery</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {formatPercent(kpis?.ontime_delivery_rate)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                SLA Compliant
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Delivery Transit</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {formatDays(kpis?.average_delivery_time_days)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Order to doorstep
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Delivery Rate</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {formatPercent(kpis?.late_delivery_rate)}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                Delayed
              </span>
            </div>
          </div>

          {/* Charts Row 1: Monthly Revenue Trend & Order Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Monthly Revenue & Order Volume
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gross Merchandise Value alongside total completed orders
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    Revenue ($)
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    Orders
                  </span>
                </div>
              </div>

              {monthlyTrend.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={(v) => formatCompactCurrency(v)}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(v) => formatNumber(v)}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                                <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1">
                                  {formatMonth(label)}
                                </div>
                                <div className="text-indigo-300">
                                  Revenue: <span className="font-bold text-white">{formatCurrency(payload[0]?.value)}</span>
                                </div>
                                {payload[1] && (
                                  <div className="text-blue-300">
                                    Orders: <span className="font-bold text-white">{formatNumber(payload[1]?.value)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        fillOpacity={0}
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No trend data" description="No trend records available for the selected filters." />
              )}
            </div>

            {/* Order Status Distribution Pie Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Order Status Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of orders by fulfillment lifecycle
                </p>
              </div>

              {orderStatusDist.length > 0 ? (
                <>
                  <div className="h-56 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusDist}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {orderStatusDist.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[entry.status.toLowerCase()] || PALETTE[index % PALETTE.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${formatNumber(value)} orders`, name]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                    {orderStatusDist.map((item) => (
                      <div key={item.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: STATUS_COLORS[item.status.toLowerCase()] || '#6366f1',
                            }}
                          ></span>
                          <span className="font-medium text-slate-700 capitalize">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-mono">
                          <span>{formatNumber(item.count)}</span>
                          <span className="text-slate-400">({formatPercent(item.percentage)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState title="No status data" description="No order statuses found." />
              )}
            </div>
          </div>

          {/* Row 2: Top Categories Bar Chart & Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Top Product Categories by GMV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Leading merchandise categories contributing to platform revenue
                </p>
              </div>
            </div>

            {topCategories.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCompactCurrency(v)}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'GMV Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No categories found" description="No category data matches the selected filter." />
            )}
          </div>

          {/* Revenue Definition Footer Banner */}
          {data?.revenue_definition && (
            <div className="bg-slate-100/80 border border-slate-200/70 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] px-2 py-0.5 bg-slate-200 rounded">
                Note
              </span>
              <p className="leading-relaxed">{data.revenue_definition}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Overview;
