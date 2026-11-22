import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { CustomerAnalytics } from './pages/CustomerAnalytics';
import { ProductAnalytics } from './pages/ProductAnalytics';
import { DeliveryAnalytics } from './pages/DeliveryAnalytics';
import { BusinessInsights } from './pages/BusinessInsights';

export function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <BrowserRouter>
      <Layout onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <Routes>
          <Route path="/" element={<Overview key={`overview-${refreshKey}`} />} />
          <Route path="/sales" element={<SalesAnalytics key={`sales-${refreshKey}`} />} />
          <Route path="/customers" element={<CustomerAnalytics key={`customers-${refreshKey}`} />} />
          <Route path="/products" element={<ProductAnalytics key={`products-${refreshKey}`} />} />
          <Route path="/delivery" element={<DeliveryAnalytics key={`delivery-${refreshKey}`} />} />
          <Route path="/insights" element={<BusinessInsights key={`insights-${refreshKey}`} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
