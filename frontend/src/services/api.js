import axios from 'axios';

// Vite env variable with fallback to default backend URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to filter out null/undefined/empty string query params
const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== null && val !== undefined && val !== '') {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Categories list for dropdowns
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  // Overview Page
  getOverview: async (params = {}) => {
    const res = await apiClient.get('/dashboard/overview', {
      params: cleanParams(params),
    });
    return res.data;
  },

  // Sales Analytics
  getSalesTrends: async (params = {}) => {
    const res = await apiClient.get('/sales/trends', {
      params: cleanParams(params),
    });
    return res.data;
  },

  getSalesCategories: async () => {
    const res = await apiClient.get('/sales/categories');
    return res.data;
  },

  // Customer Analytics
  getCustomersSummary: async () => {
    const res = await apiClient.get('/customers/summary');
    return res.data;
  },

  getCustomerSegments: async () => {
    const res = await apiClient.get('/customers/segments');
    return res.data;
  },

  // Product Analytics
  getProductAnalytics: async () => {
    const res = await apiClient.get('/products/top');
    return res.data;
  },

  // Delivery Analytics
  getDeliveryPerformance: async (params = {}) => {
    const res = await apiClient.get('/delivery/performance', {
      params: cleanParams(params),
    });
    return res.data;
  },

  // Business Insights
  getBusinessInsights: async () => {
    const res = await apiClient.get('/insights');
    return res.data;
  },
};

export default api;
