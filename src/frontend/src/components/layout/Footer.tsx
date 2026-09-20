import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-sand-300 pt-12 pb-8 border-t border-charcoal-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-white flex items-center justify-center">
                <Recycle className="w-5 h-5 text-forest-300" />
              </div>
              <span className="text-base font-bold text-white font-display">ReBuild Mysore</span>
            </div>
            <p className="text-sand-400 leading-relaxed text-xs">
              Turning Construction Waste into Community Value. A circular civic tech platform for the heritage city of Mysuru.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-charcoal-800 text-emerald-400 border border-charcoal-700 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>72h Hackathon Prototype</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Circular Workflow</h4>
            <ul className="space-y-2 text-sand-400">
              <li><Link to="/report" className="hover:text-white transition">Citizen Waste Reporting</Link></li>
              <li><Link to="/citizen" className="hover:text-white transition">AI Debris Composition</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Verification & Dispatch</Link></li>
              <li><Link to="/collection" className="hover:text-white transition">Field Haul & Proof</Link></li>
              <li><Link to="/processing" className="hover:text-white transition">Aggregate Recovery & Pavers</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Civic & Impact</h4>
            <ul className="space-y-2 text-sand-400">
              <li><Link to="/impact" className="hover:text-white transition">Landfill Diversion Metrics</Link></li>
              <li><Link to="/materials" className="hover:text-white transition">Recycled Paver Catalog</Link></li>
              <li><Link to="/admin/map" className="hover:text-white transition">Interactive GIS Map</Link></li>
              <li><Link to="/admin/hotspots" className="hover:text-white transition">High-density Ward Hotspots</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sand-500 text-[11px]">
          <p>© {new Date().getFullYear()} ReBuild Mysore. Civic Technology Initiative for Clean Mysuru.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" /> for Mysuru Citizens & Builders
          </p>
        </div>
      </div>
    </footer>
  );
};
