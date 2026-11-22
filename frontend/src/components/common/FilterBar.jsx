import React, { useState, useEffect } from 'react';
import { Filter, Calendar, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { api } from '../../services/api';

export const FilterBar = ({
  onApplyFilters,
  onResetFilters,
  showCategory = true,
  showState = true,
  showDate = true,
  initialFilters = {},
}) => {
  const [categories, setCategories] = useState([]);
  const [startDate, setStartDate] = useState(initialFilters.start_date || '');
  const [endDate, setEndDate] = useState(initialFilters.end_date || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedState, setSelectedState] = useState(initialFilters.state || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (showCategory) {
      api.getCategories()
        .then((cats) => {
          if (isMounted) setCategories(cats || []);
        })
        .catch(() => {
          // Non-blocking error for categories dropdown
        });
    }
    return () => {
      isMounted = false;
    };
  }, [showCategory]);

  const handleApply = (e) => {
    if (e) e.preventDefault();
    onApplyFilters({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      category: selectedCategory || undefined,
      state: selectedState ? selectedState.toUpperCase().trim() : undefined,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSelectedState('');
    onResetFilters();
  };

  const setPreset = (preset) => {
    if (preset === '2018') {
      setStartDate('2018-01-01');
      setEndDate('2018-08-31');
    } else if (preset === '2017') {
      setStartDate('2017-01-01');
      setEndDate('2017-12-31');
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const hasActiveFilters = Boolean(startDate || endDate || selectedCategory || selectedState);

  // Brazilian states commonly found in Olist dataset
  const states = [
    'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'ES', 'GO', 'PE', 'CE', 'PA', 'MT', 'MS', 'MA', 'PB', 'RN'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Analytics Filters
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              Active Filters
            </span>
          )}
        </div>

        {/* Quick Date Presets */}
        {showDate && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 hidden sm:inline">Presets:</span>
            <button
              type="button"
              onClick={() => setPreset('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !startDate && !endDate
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setPreset('2018')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                startDate === '2018-01-01' && endDate === '2018-08-31'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              2018 YTD
            </button>
            <button
              type="button"
              onClick={() => setPreset('2017')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                startDate === '2017-01-01' && endDate === '2017-12-31'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Full Year 2017
            </button>
          </div>
        )}
      </div>

      {/* Filter Inputs Grid */}
      <form onSubmit={handleApply} className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {showDate && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                min="2016-09-01"
                max="2018-10-31"
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 bg-white"
              />
            </div>
          </div>
        )}

        {showDate && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min="2016-09-01"
                max="2018-10-31"
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 bg-white"
              />
            </div>
          </div>
        )}

        {showCategory && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 bg-white truncate"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        )}

        {showState && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">State (Province)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 bg-white"
            >
              <option value="">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;
