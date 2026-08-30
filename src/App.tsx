import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

// Admin layout & pages
import AdminLayout from './layouts/AdminLayout';
import HabitatManagement from './pages/admin/HabitatManagement';
import TaxonomyManagement from './pages/admin/TaxonomyManagement';
import FertilizerManagement from "./pages/admin/FertilizerManagement.tsx";
import PlantPartManagement from "./pages/admin/PlantPartManagement.tsx";

const happyFarmTheme = {
  token: {
    colorPrimary: '#2e7d32',
    colorInfo: '#2e7d32',
    colorSuccess: '#4caf50',
    colorWarning: '#ff9800',
    colorError: '#f44336',
    fontFamily: 'Outfit, sans-serif',
    borderRadius: 8,
  },
  components: {
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: '#2e7d32',
      darkItemSelectedColor: '#ffffff',
    },
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={happyFarmTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/habitats" replace />} />
              <Route path="habitats" element={<HabitatManagement />} />
              <Route path="taxonomies" element={<TaxonomyManagement />} />
              <Route path="fertilizers" element={<FertilizerManagement />}/>
              <Route path="plant-parts" element={<PlantPartManagement />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
