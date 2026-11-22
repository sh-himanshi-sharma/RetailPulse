import React, { useState, useEffect } from 'react';
import {
  Users,
  Repeat,
  DollarSign,
  TrendingUp,
  Award,
  Crown,
  Info,
  ShieldAlert,
  Sparkles,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  formatCompactNumber,
  formatNumber,
  formatPercent,
  formatDate,
  formatMonth,
} from '../utils/formatters';
import { KpiCard } from '../components/common/KpiCard';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const SEGMENT_COLORS = {
  Champions: '#4f46e5',
  'Loyal Customers': '#06b6d4',
  'Potential Loyalists': '#10b981',
  'At Risk': '#f59e0b',
  Hibernating: '#64748b',
};

export const CustomerAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCustomersSummary();
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

  const kpis = data?.kpis;
  const customerTrends = data?.customer_trends || [];
  const rfmSegments = data?.rfm_segments || [];
  const spendingDist = data?.spending_distribution || [];
  const orderFreq = data?.order_frequency || [];
  const topCustomers = data?.top_customers || [];
  const rfmExplanation = data?.rfm_explanation || {};

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CardSkeleton count={4} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton height="h-80" />
            <ChartSkeleton height="h-80" />
          </div>
        </>
      )}

      {/* Error state */}
      {error && !loading && (
        <ErrorMessage
          title="Could not load customer analytics"
          message="Failed to retrieve RFM segmentation and customer metrics."
          error={error}
          onRetry={fetchData}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Total Customers"
              value={formatNumber(kpis?.total_unique_customers)}
              icon={Users}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              subtext="Unique buyer accounts"
            />
            <KpiCard
              title="Repeat Customers"
              value={formatNumber(kpis?.repeat_customers)}
              icon={Repeat}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Ordered >1 time"
            />
            <KpiCard
              title="Repeat Rate"
              value={formatPercent(kpis?.repeat_customer_rate)}
              icon={TrendingUp}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="Cohort repeat baseline"
            />
            <KpiCard
              title="Average CLV"
              value={formatCurrency(kpis?.avg_customer_lifetime_value)}
              icon={DollarSign}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              subtext="Mean spend per customer"
            />
            <KpiCard
              title="Orders / Customer"
              value={Number(kpis?.avg_orders_per_customer || 1).toFixed(2)}
              icon={Award}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              subtext="Purchase frequency"
            />
          </div>

          {/* RFM Segmentation Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-indigo-600" />
                  RFM Behavioral Customer Segmentation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recency, Frequency & Monetary segmentation classifying buyers by value and engagement
                </p>
              </div>
            </div>

            {/* Segment Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {rfmSegments.map((seg) => {
                const color = SEGMENT_COLORS[seg.segment] || '#4f46e5';
                const isSelected = selectedSegment === seg.segment;
                return (
                  <div
                    key={seg.segment}
                    onClick={() => setSelectedSegment(isSelected ? null : seg.segment)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{seg.segment}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      ></span>
                    </div>

                    <div className="text-lg font-bold text-slate-900">
                      {formatNumber(seg.customer_count)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {formatPercent(seg.percentage)} of user base
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Recency:</span>
                        <span className="font-mono font-medium">{Math.round(seg.avg_recency)}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Spend:</span>
                        <span className="font-mono font-medium">{formatCurrency(seg.avg_monetary, 0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RFM Strategic Guide Notice */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-slate-700">
                <Info className="w-4 h-4 text-indigo-600" />
                Strategic Segment Definitions & Recommendations:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-slate-600">
                {Object.entries(rfmExplanation).map(([key, desc]) => (
                  <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="font-bold text-slate-800">{key}:</span>{' '}
                    <span className="text-slate-600 text-[11px] leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row: Monthly Growth & Spending Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New vs Returning Customers Trend */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Customer Acquisition Cohorts
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monthly new buyer influx vs repeat customer activity
                  </p>
                </div>
              </div>

              {customerTrends.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tickFormatter={(v) => formatNumber(v)}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val, name) => [
                          formatNumber(val),
                          name === 'new_customers' ? 'New Customers' : 'Repeat Customers',
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(value) => (value === 'new_customers' ? 'New Customers' : 'Returning Customers')}
                      />
                      <Bar dataKey="new_customers" fill="#4f46e5" radius={[3, 3, 0, 0]} name="new_customers" />
                      <Bar dataKey="returning_customers" fill="#06b6d4" radius={[3, 3, 0, 0]} name="returning_customers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No trend data" description="Customer trends unavailable." />
              )}
            </div>

            {/* Spending & Frequency Distribution */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Customer Spending Tiers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of total customers by lifetime spend bracket
                </p>
              </div>

              {spendingDist.length > 0 ? (
                <>
                  <div className="h-52 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendingDist} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="spending_range"
                          tick={{ fontSize: 11, fill: '#334155' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          tickFormatter={(v) => formatCompactNumber(v)}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(val) => [`${formatNumber(val)} customers`, 'Count']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                        <Bar dataKey="customer_count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                          {spendingDist.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#818cf8', '#6366f1', '#4f46e5', '#3730a3'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                    {spendingDist.map((tier) => (
                      <div key={tier.spending_range} className="bg-slate-50 p-2 rounded-lg text-center">
                        <div className="text-[11px] text-slate-500 font-medium">{tier.spending_range}</div>
                        <div className="font-bold text-slate-800 mt-0.5">{formatPercent(tier.percentage)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState title="No spending data" description="No spending brackets calculated." />
              )}
            </div>
          </div>

          {/* Top Customer Accounts Leaderboard */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Highest-Value Customer Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top verified individual purchasers ranked by total historical GMV expenditure
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Customer Unique ID</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Orders Placed</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-center">RFM Segment</th>
                    <th className="py-3 px-4 text-right">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCustomers.map((cust, idx) => (
                    <tr key={cust.customer_unique_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                        {cust.customer_unique_id.slice(0, 8)}...{cust.customer_unique_id.slice(-4)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 capitalize">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {cust.city ? cust.city.toLowerCase() : 'Unknown'}, <span className="font-semibold text-slate-800">{cust.state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {formatNumber(cust.orders_count)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                        {formatCurrency(cust.total_spent)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-full"
                          style={{
                            backgroundColor: `${SEGMENT_COLORS[cust.segment] || '#4f46e5'}15`,
                            color: SEGMENT_COLORS[cust.segment] || '#4f46e5',
                            border: `1px solid ${SEGMENT_COLORS[cust.segment] || '#4f46e5'}30`,
                          }}
                        >
                          {cust.segment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono">
                        {formatDate(cust.last_order_date)}
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

export default CustomerAnalytics;
