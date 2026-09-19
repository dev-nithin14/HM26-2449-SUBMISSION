import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ProcessingDashboard } from './pages/processing/ProcessingDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { HotspotsPage } from './pages/admin/HotspotsPage';
import { ImpactDashboard } from './pages/impact/ImpactDashboard';
import { RebuildMaterialsPage } from './pages/impact/RebuildMaterialsPage';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#faf8f5]">
          <DemoUserBar />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/overview" element={<LandingPage />} />
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/report" element={<ReportWasteWizard />} />
              <Route path="/reports/:id" element={<ReportDetailPage />} />
              <Route path="/collection" element={<CollectionDashboard />} />
              <Route path="/processing" element={<ProcessingDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/map" element={<AdminMapPage />} />
              <Route path="/admin/hotspots" element={<HotspotsPage />} />
              <Route path="/impact" element={<ImpactDashboard />} />
              <Route path="/materials" element={<RebuildMaterialsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
