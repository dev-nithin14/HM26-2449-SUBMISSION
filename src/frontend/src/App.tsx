import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoUserBar } from './components/layout/DemoUserBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportWasteWizard } from './pages/citizen/ReportWasteWizard';
import { ReportDetailPage } from './pages/citizen/ReportDetailPage';
import { CollectionDashboard } from './pages/collection/CollectionDashboard';
import { CityDebrisPage } from './pages/collection/CityDebrisPage';
import { ProcessingDashboard } from './pages/processing/ProcessingDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { HotspotsPage } from './pages/admin/HotspotsPage';
import { ImpactDashboard } from './pages/impact/ImpactDashboard';
import { RebuildMaterialsPage } from './pages/impact/RebuildMaterialsPage';
import { NotFound } from './pages/NotFound';
import { DemoLoginPage } from './pages/DemoLoginPage';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

const roleHome: Record<UserRole, string> = {
  CITIZEN: '/citizen',
  BUILDER: '/citizen',
  COLLECTION_TEAM: '/collection',
  PROCESSING_TEAM: '/processing',
  ADMIN: '/admin'
};

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles?: UserRole[] }> = ({
  children,
  roles
}) => {
  const { activeRole, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-charcoal-500">Loading workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(activeRole)) {
    return <Navigate to={roleHome[activeRole]} replace />;
  }

  return children;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isEntry = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      {isAuthenticated && !isEntry && <DemoUserBar />}
      {isAuthenticated && !isEntry && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<DemoLoginPage />} />
          <Route path="/login" element={<DemoLoginPage />} />
          <Route path="/overview" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
          <Route path="/citizen" element={<ProtectedRoute roles={['CITIZEN', 'BUILDER']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute roles={['CITIZEN', 'BUILDER']}><ReportWasteWizard /></ProtectedRoute>} />
          <Route path="/reports/:id" element={<ProtectedRoute roles={['CITIZEN', 'BUILDER', 'ADMIN']}><ReportDetailPage /></ProtectedRoute>} />
          <Route path="/collection" element={<ProtectedRoute roles={['COLLECTION_TEAM', 'ADMIN']}><CollectionDashboard /></ProtectedRoute>} />
          <Route path="/city-debris" element={<ProtectedRoute roles={['COLLECTION_TEAM', 'ADMIN']}><CityDebrisPage /></ProtectedRoute>} />
          <Route path="/processing" element={<ProtectedRoute roles={['PROCESSING_TEAM', 'ADMIN']}><ProcessingDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/map" element={<ProtectedRoute roles={['ADMIN', 'COLLECTION_TEAM']}><AdminMapPage /></ProtectedRoute>} />
          <Route path="/admin/hotspots" element={<ProtectedRoute roles={['ADMIN']}><HotspotsPage /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute roles={['CITIZEN', 'BUILDER', 'PROCESSING_TEAM', 'ADMIN']}><ImpactDashboard /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute roles={['CITIZEN', 'BUILDER', 'PROCESSING_TEAM', 'ADMIN']}><RebuildMaterialsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {isAuthenticated && !isEntry && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
