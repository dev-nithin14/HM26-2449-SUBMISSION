import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Recycle,
  ArrowRight,
  ShieldCheck,
  Truck,
  Cog,
  BarChart3,
  CheckCircle2,
  HardHat,
  Users,
  Building,
  Sparkles,
  MapPin,
  Leaf
} from 'lucide-react';
import { analyticsApi } from '../api/client';
import { ImpactMetrics } from '../types';

export const LandingPage: React.FC = () => {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);

  useEffect(() => {
    analyticsApi
      .getImpact()
      .then(setImpact)
      .catch(() => {});
  }, []);

  const workflowSteps = [
    { title: 'Report', desc: 'Citizen or builder uploads photos & pins location in Mysuru.', icon: <MapPin className="w-5 h-5 text-emerald-600" /> },
    { title: 'Analyze', desc: 'Prototype AI predicts material composition & recyclability.', icon: <Sparkles className="w-5 h-5 text-purple-600" /> },
    { title: 'Verify', desc: 'MCC civic desk verifies validity & detects duplicates.', icon: <ShieldCheck className="w-5 h-5 text-blue-600" /> },
    { title: 'Collect', desc: 'Nearest geo-routed haul crew dispatches with tipper truck.', icon: <Truck className="w-5 h-5 text-amber-600" /> },
    { title: 'Process', desc: 'Crushing, mechanical screening & aggregate recovery.', icon: <Cog className="w-5 h-5 text-orange-600" /> },
    { title: 'Rebuild', desc: 'Transformed into civic interlocking pavers & blocks.', icon: <Recycle className="w-5 h-5 text-forest-700" /> },
    { title: 'Measure Impact', desc: 'CO2 mitigation & landfill diversion calculated in real time.', icon: <BarChart3 className="w-5 h-5 text-emerald-700" /> }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-forest-50/70 via-sand-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200 text-xs font-semibold mb-6 shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-forest-700" />
            <span>Circular Construction Waste Initiative for Mysuru</span>
          </div>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold text-charcoal-900 tracking-tight font-display max-w-4xl mx-auto leading-[1.1] break-words">
            Turning Construction Waste into <span className="text-forest-700 underline decoration-terracotta-400 decoration-wavy decoration-2">Community Value</span>.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            A technology-enabled circular construction platform that helps identify, verify, collect, track and recycle construction and demolition waste across Mysuru.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="w-full max-w-sm sm:w-auto px-8 py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold shadow-lg shadow-forest-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base active:scale-95"
            >
              <span>Report Waste</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/impact"
              className="w-full max-w-sm sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-sand-50 text-charcoal-800 font-semibold border border-sand-300 shadow-sm hover:shadow transition flex items-center justify-center gap-2 text-base"
            >
              <span>Explore Impact</span>
            </Link>
          </div>

          {/* Metrics Teaser */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-sand-200 shadow-md">
            <div className="text-center p-2 border-r border-sand-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-forest-800 font-display">
                {impact ? impact.total_waste_diverted_tons : '42.5'} T
              </div>
              <p className="text-[11px] text-charcoal-500 uppercase tracking-wider font-semibold mt-1">
                Waste Diverted (Est.)
              </p>
            </div>
            <div className="text-center p-2 border-r border-sand-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-terracotta-600 font-display">
                {impact ? impact.total_recycled_pavers_produced.toLocaleString() : '2,850'}
              </div>
              <p className="text-[11px] text-charcoal-500 uppercase tracking-wider font-semibold mt-1">
                Recycled Pavers
              </p>
            </div>
            <div className="text-center p-2 border-r border-sand-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-800 font-display">
                {impact ? impact.total_co2_offset_kg.toLocaleString() : '10,200'} kg
              </div>
              <p className="text-[11px] text-charcoal-500 uppercase tracking-wider font-semibold mt-1">
                CO₂ Offset (Est.)
              </p>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
                88%
              </div>
              <p className="text-[11px] text-charcoal-500 uppercase tracking-wider font-semibold mt-1">
                Recovery Rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-charcoal-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-terracotta-400 uppercase tracking-wider text-xs font-bold">
                The Urban Challenge
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-sand-50">
                Preserving Mysuru’s Heritage against Unorganized Demolition Dumping.
              </h2>
              <p className="text-sand-300 text-sm leading-relaxed">
                As Mysuru expands along Ring Road, Vijayanagar, and Hebbal, over 80 metric tons of construction debris are generated daily. Unchecked dumping encroaches pedestrian walkways, clogs storm-water drains leading to Kukkarahalli Lake, and squanders high-grade aggregate minerals.
              </p>
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2.5 text-sand-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Illegal roadside dumping in heritage buffer corridors</span>
                </div>
                <div className="flex items-center gap-2.5 text-sand-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Loss of recyclable red bricks and structural concrete</span>
                </div>
                <div className="flex items-center gap-2.5 text-sand-200">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0" />
                  <span>Burden on municipal landfill capacity at Vidyaranyapuram</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 space-y-2">
                <span className="text-3xl font-extrabold text-terracotta-400 font-display">85 T/day</span>
                <h4 className="text-sm font-semibold text-white">Estimated C&D Generation</h4>
                <p className="text-xs text-sand-400 leading-relaxed">
                  Daily construction rubble across residential renovations and commercial sites.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 space-y-2">
                <span className="text-3xl font-extrabold text-forest-400 font-display">90%</span>
                <h4 className="text-sm font-semibold text-white">Recyclability Potential</h4>
                <p className="text-xs text-sand-400 leading-relaxed">
                  Clean concrete & brick masonry can be transformed into certified subgrade pavers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How ReBuild Works Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-forest-700 uppercase tracking-wider text-xs font-bold">
            End-to-End Civic Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 font-display">
            How ReBuild Mysore Works
          </h2>
          <p className="text-sm text-charcoal-600">
            A traceable 7-stage closed-loop ecosystem connecting citizens, municipal dispatchers, haulers, and aggregate recyclers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {workflowSteps.slice(0, 4).map((step, idx) => (
            <div
              key={step.title}
              className="p-5 rounded-2xl bg-white border border-sand-200 shadow-sm hover:border-forest-600 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sand-100">{step.icon}</div>
                <span className="text-xs font-mono font-bold text-sand-400">0{idx + 1}</span>
              </div>
              <h3 className="text-base font-bold text-charcoal-900">{step.title}</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {workflowSteps.slice(4).map((step, idx) => (
            <div
              key={step.title}
              className="p-5 rounded-2xl bg-white border border-sand-200 shadow-sm hover:border-forest-600 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sand-100">{step.icon}</div>
                <span className="text-xs font-mono font-bold text-sand-400">0{idx + 5}</span>
              </div>
              <h3 className="text-base font-bold text-charcoal-900">{step.title}</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stakeholder Benefits: Builders, Communities, Workers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-terracotta-600 uppercase tracking-wider text-xs font-bold">
            Value Creation
          </span>
          <h2 className="text-3xl font-extrabold text-charcoal-900 font-display">
            Designed for Every Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900">For Builders & Contractors</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Transparent, compliant C&D debris offloading with digital haul receipts. Access certified secondary aggregate products for road sub-base and landscaping at lower prototype costs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900">For Communities & Residents</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Clean neighborhood streets, unblocked pedestrian footpaths, and rapid municipal grievance resolution. Watch your neighborhood debris transform into public park paving blocks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900">For Logistics & Field Crews</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Digitized collection dispatch, GPS navigation to accumulation points, automated photo proof upload, and verified weighbridge intake tickets with zero paper lag.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-800 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
              Have Construction Debris to Clear in Mysuru?
            </h2>
            <p className="text-forest-200 text-sm leading-relaxed">
              Submit your report in under 2 minutes with photos and location pin. Our AI will analyze your debris and dispatch the nearest collection unit.
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold shadow-lg shadow-terracotta-900/30 transition active:scale-95"
              >
                <span>Report Waste Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
