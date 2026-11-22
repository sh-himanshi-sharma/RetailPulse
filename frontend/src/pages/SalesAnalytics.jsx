import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  Calendar,
  Award,
  ArrowDownCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  formatMonth,
} from '../utils/formatters';
import { KpiCard } from '../components/common/KpiCard';
import { FilterBar } from '../components/common/FilterBar';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const PAYMENT_COLORS = {
  credit_card: '#4f46e5',
  boleto: '#06b6d4',
  voucher: '#f59e0b',
  debit_card: '#10b981',
  not_defined: '#94a3b8',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [activeCategoryTab, setActiveCategoryTab] = useState('best'); // 'best' | 'lowest'

  const fetchData = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSalesTrends(activeFilters);
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

  const revenueOverTime = data?.revenue_over_time || [];
  const monthlyYearlyComparison = (data?.monthly_yearly_comparison || []).map((item) => {
    const monthIndex = parseInt(item.month, 10) - 1;
    return {
      ...item,
      monthName: MONTH_NAMES[monthIndex] || item.month,
    };
  });
  const paymentTypes = data?.revenue_by_payment_type || [];
  const bestCategories = data?.best_performing_categories || [];
  const lowestCategories = data?.lowest_performing_categories || [];

  // Summary Metrics
  const totalRevenue = revenueOverTime.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = revenueOverTime.reduce((sum, item) => sum + (item.orders || 0), 0);
  const averageAov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topPayment = paymentTypes.length > 0 ? paymentTypes[0] : null;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        onApplyFilters={(f) => setFilters(f)}
        onResetFilters={() => setFilters({})}
        initialFilters={filters}
        showCategory={true}
        showState={false}
        showDate={true}
      />

      {loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CardSkeleton count={4} />
          </div>
          <ChartSkeleton height="h-96" />
        </>
      )}

      {error && !loading && (
        <ErrorMessage
          title="Could not load sales analytics"
          message="Failed to fetch sales performance trends from backend."
          error={error}
          onRetry={() => fetchData(filters)}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Window Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              subtext="Aggregated for active timeframe"
            />
            <KpiCard
              title="Window Total Orders"
              value={formatNumber(totalOrders)}
              icon={TrendingUp}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Orders in current scope"
            />
            <KpiCard
              title="Average Order Value"
              value={formatCurrency(averageAov)}
              icon={ShoppingBag}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              subtext="Mean transaction basket size"
            />
            <KpiCard
              title="Dominant Payment Type"
              value={topPayment ? topPayment.payment_type.replace('_', ' ').toUpperCase() : 'N/A'}
              icon={CreditCard}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext={topPayment ? `${formatPercent(topPayment.percentage)} of total sales volume` : 'Payment share'}
            />
          </div>

          {/* YoY Monthly Revenue Comparison Chart */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Year-Over-Year Monthly Revenue (2017 vs 2018)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct revenue comparison across matching calendar months
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300"></span>
                  2017 Revenue
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
                  2018 Revenue
                </span>
              </div>
            </div>

            {monthlyYearlyComparison.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyYearlyComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="monthName"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompactCurrency(v)}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        formatCurrency(val),
                        name === 'revenue_2017' ? '2017 Revenue' : '2018 Revenue',
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue_2017" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="revenue_2017" />
                    <Bar dataKey="revenue_2018" fill="#4f46e5" radius={[4, 4, 0, 0]} name="revenue_2018" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No comparison data" description="Could not compute year-over-year revenue metrics." />
            )}
          </div>

          {/* Revenue Over Time & Payment Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Over Time */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Revenue & AOV Trend
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous timeline trajectory of revenue and average basket size
                  </p>
                </div>
              </div>

              {revenueOverTime.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueOverTime} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
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
                        tickFormatter={(v) => formatCurrency(v, 0)}
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
                                  {label}
                                </div>
                                <div className="text-indigo-300">
                                  Revenue: <span className="font-bold text-white">{formatCurrency(payload[0]?.value)}</span>
                                </div>
                                {payload[1] && (
                                  <div className="text-emerald-300">
                                    AOV: <span className="font-bold text-white">{formatCurrency(payload[1]?.value)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                        name="Revenue"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="aov"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="3 3"
                        name="AOV"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No timeline data" description="No timeline data found for selected period." />
              )}
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Payment Method Share
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Merchandise transaction volume by payment channel
                </p>
              </div>

              {paymentTypes.length > 0 ? (
                <>
                  <div className="h-48 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentTypes}
                          dataKey="total_revenue"
                          nameKey="payment_type"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {paymentTypes.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PAYMENT_COLORS[entry.payment_type.toLowerCase()] || '#818cf8'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [formatCurrency(value), name.replace('_', ' ').toUpperCase()]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {paymentTypes.map((item) => (
                      <div key={item.payment_type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: PAYMENT_COLORS[item.payment_type.toLowerCase()] || '#6366f1',
                            }}
                          ></span>
                          <span className="font-medium text-slate-700 capitalize">
                            {item.payment_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-mono">
                          <span>{formatCurrency(item.total_revenue)}</span>
                          <span className="text-slate-400">({formatPercent(item.percentage)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState title="No payment data" description="No payment types recorded." />
              )}
            </div>
          </div>

          {/* Best vs Lowest Performing Categories Matrix */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Category Performance Spectrum
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed comparison of highest vs lowest grossing product niches
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveCategoryTab('best')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    activeCategoryTab === 'best'
                      ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Top Performers ({bestCategories.length})
                </button>
                <button
                  onClick={() => setActiveCategoryTab('lowest')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    activeCategoryTab === 'lowest'
                      ? 'bg-white text-rose-600 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-500" />
                  Lowest Performers ({lowestCategories.length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Revenue (GMV)</th>
                    <th className="py-3 px-4 text-right">Orders Count</th>
                    <th className="py-3 px-4 text-right">Units Sold</th>
                    <th className="py-3 px-4 text-right">Average Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeCategoryTab === 'best' ? bestCategories : lowestCategories).map((cat, idx) => (
                    <tr key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {cat.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {formatCurrency(cat.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {formatNumber(cat.orders_count)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {formatNumber(cat.units_sold)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-indigo-600 font-semibold">
                        {formatCurrency(cat.aov)}
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

export default SalesAnalytics;
