import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Cog, HardHat, Home, Recycle, Shield, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const demoRoles: Array<{
  role: UserRole;
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}> = [
  { role: 'CITIZEN', label: 'Citizen', description: 'Report and track local construction waste.', path: '/citizen', icon: <Home className="w-6 h-6" /> },
  { role: 'BUILDER', label: 'Builder', description: 'Manage construction or demolition waste reports.', path: '/citizen', icon: <HardHat className="w-6 h-6" /> },
  { role: 'COLLECTION_TEAM', label: 'Collection Team', description: 'View assigned pickups and upload collection proof.', path: '/collection', icon: <Truck className="w-6 h-6" /> },
  { role: 'PROCESSING_TEAM', label: 'Processing Team', description: 'Track sorting, recovery, and recycled-material batches.', path: '/processing', icon: <Cog className="w-6 h-6" /> },
  { role: 'ADMIN', label: 'Admin', description: 'Verify reports, coordinate dispatch, and monitor the city.', path: '/admin', icon: <Shield className="w-6 h-6" /> }
];

export const DemoLoginPage: React.FC = () => {
  const { switchRole, isLoading } = useAuth();
  const navigate = useNavigate();

  const chooseRole = async (role: UserRole, path: string) => {
    await switchRole(role);
    navigate(path);
  };

  return (
    <section className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-forest-50 via-sand-50 to-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-700 text-white shadow-lg shadow-forest-900/20">
            <Recycle className="h-9 w-9 text-forest-200" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest-700">ReBuild Mysore</p>
          <h1 className="font-display text-3xl font-extrabold text-charcoal-900 sm:text-4xl">Choose a demo role</h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-600 sm:text-base">
            Select a role to enter the matching prototype workspace. This is a demo role selector, not production authentication.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoRoles.map(({ role, label, description, path, icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => chooseRole(role, path)}
              disabled={isLoading}
              className="group rounded-2xl border border-sand-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-forest-500 hover:shadow-lg disabled:cursor-wait disabled:opacity-70"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition group-hover:bg-forest-700 group-hover:text-white">
                {icon}
              </span>
              <span className="block text-lg font-bold text-charcoal-900">{label}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-charcoal-600">{description}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-charcoal-500">
          <Building2 className="h-4 w-4 text-terracotta-600" />
          <span>Prototype for Mysuru construction and demolition waste management.</span>
        </div>
      </div>
    </section>
  );
};
