import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Package,
  Star,
  Truck,
  TrendingUp,
  Search,
  ArrowUpDown,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from '../utils/formatters';
import { KpiCard } from '../components/common/KpiCard';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const ProductAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_revenue'); // 'total_revenue' | 'units_sold' | 'avg_review_score' | 'aov'
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProductAnalytics();
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

  const topByRev = data?.top_categories_by_revenue || [];
  const topByVol = data?.top_categories_by_volume || [];
  const fullTable = data?.category_performance_table || [];

  // Summary Highlights
  const highestRevCategory = topByRev.length > 0 ? topByRev[0] : null;
  const highestVolCategory = topByVol.length > 0 ? topByVol[0] : null;

  const highestRatedCategory = useMemo(() => {
    if (!fullTable.length) return null;
    return [...fullTable].sort((a, b) => (b.avg_review_score || 0) - (a.avg_review_score || 0))[0];
  }, [fullTable]);

  const totalCatalogRevenue = useMemo(() => {
    return fullTable.reduce((acc, row) => acc + (row.total_revenue || 0), 0);
  }, [fullTable]);

  // Filtered & Sorted Table
  const filteredTable = useMemo(() => {
    return fullTable
      .filter((item) =>
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA = a[sortBy] || 0;
        let valB = b[sortBy] || 0;
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [fullTable, searchTerm, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
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

      {error && !loading && (
        <ErrorMessage
          title="Could not load product analytics"
          message="Failed to retrieve category performance matrix."
          error={error}
          onRetry={fetchData}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Top Revenue Category"
              value={highestRevCategory ? highestRevCategory.category : 'N/A'}
              icon={DollarSign}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              subtext={highestRevCategory ? `${formatCurrency(highestRevCategory.revenue)} total GMV` : ''}
            />
            <KpiCard
              title="Top Volume Category"
              value={highestVolCategory ? highestVolCategory.category : 'N/A'}
              icon={Package}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext={highestVolCategory ? `${formatNumber(highestVolCategory.units_sold)} units shipped` : ''}
            />
            <KpiCard
              title="Highest Rated Category"
              value={highestRatedCategory ? highestRatedCategory.category : 'N/A'}
              icon={Star}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              subtext={highestRatedCategory ? `${highestRatedCategory.avg_review_score.toFixed(2)}/5.0 avg review` : ''}
            />
            <KpiCard
              title="Analyzed Categories GMV"
              value={formatCurrency(totalCatalogRevenue)}
              icon={ShoppingBag}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext={`Across ${fullTable.length} product sectors`}
            />
          </div>

          {/* Dual Bar Charts: Top by GMV & Top by Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top by Revenue */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Top 10 Categories by GMV Revenue
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Merchandise gross value rankings
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topByRev}
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
                      width={110}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'GMV Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                      {topByRev.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#4338ca' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top by Volume */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Top 10 Categories by Units Sold
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total physical merchandise quantity delivered
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topByVol}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatNumber(v)}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      formatter={(val) => [`${formatNumber(val)} units`, 'Units Sold']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="units_sold" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                      {topByVol.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#0891b2' : '#22d3ee'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Performance Comprehensive Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Category Performance Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed unit economics, average shipping freight, and CSAT customer ratings
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 hover:text-slate-800"
                      >
                        Category
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSort('total_revenue')}
                        className="inline-flex items-center gap-1 hover:text-slate-800 ml-auto"
                      >
                        Total Revenue
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSort('units_sold')}
                        className="inline-flex items-center gap-1 hover:text-slate-800 ml-auto"
                      >
                        Units Sold
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">Unique SKUs</th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSort('aov')}
                        className="inline-flex items-center gap-1 hover:text-slate-800 ml-auto"
                      >
                        AOV
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">Avg Freight</th>
                    <th className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSort('avg_review_score')}
                        className="inline-flex items-center gap-1 hover:text-slate-800 mx-auto"
                      >
                        Review Score
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTable.map((cat, idx) => (
                    <tr key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {cat.category}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                        {formatCurrency(cat.total_revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 font-mono">
                        {formatNumber(cat.units_sold)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono">
                        {formatNumber(cat.unique_products)}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-600 font-semibold font-mono">
                        {formatCurrency(cat.aov)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {formatCurrency(cat.avg_freight)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cat.avg_review_score >= 4.2
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : cat.avg_review_score >= 3.8
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          {cat.avg_review_score.toFixed(2)}
                        </span>
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

export default ProductAnalytics;
