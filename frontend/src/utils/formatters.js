/**
 * Utility formatters for metrics, currency, percentages and dates.
 */

export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatCompactCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(value, 0);
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return formatNumber(value);
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatDays = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0 days';
  return `${Number(value).toFixed(decimals)} days`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  // "YYYY-MM" or "MM"
  if (/^\d{4}-\d{2}$/.test(monthStr)) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  if (/^\d{2}$/.test(monthStr)) {
    const monthIndex = parseInt(monthStr, 10) - 1;
    const date = new Date(2020, monthIndex, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  return monthStr;
};
