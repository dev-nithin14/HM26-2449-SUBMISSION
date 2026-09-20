import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi, analyticsApi } from '../../api/client';
import { Report, ImpactMetrics } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Recycle,
  Sparkles,
  Search,
  ChevronRight,
  Filter,
  FileText,
  MapPin
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export const CitizenDashboard: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      const filters: Record<string, string | undefined> = {
        search: searchQuery || undefined,
        status: statusFilter || undefined
      };
      if (currentUser?.id) {
        filters.citizen_id = currentUser.id;
      }
      const [reps, imp] = await Promise.all([
        reportsApi.getAll(filters),
        analyticsApi.getImpact()
      ]);
      setReports(reps);
      setImpact(imp);
    } catch (err) {
      console.error('Failed to load citizen dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useRealtimeSync(['reports'], loadData);

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, activeRole, currentUser?.id]);

  // Compute citizen specific KPIs
  const activeCount = reports.filter(
    (r) => !['RECYCLED', 'REJECTED', 'DUPLICATE', 'CANCELLED'].includes(r.status)
  ).length;

  const collectedCount = reports.filter((r) =>
    ['COLLECTED', 'SORTING', 'PROCESSING', 'RECYCLED'].includes(r.status)
  ).length;

  const recycledCount = reports.filter((r) => r.status === 'RECYCLED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 font-display">
              Citizen & Builder Portal
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-semibold">
              Mysuru Circle
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Logged in as <strong className="text-charcoal-800">{currentUser?.name}</strong>. Track your submitted demolition waste, AI analysis status, and collection progress.
          </p>
        </div>

        <Link to="/report">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report Construction Waste
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-forest-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Active Reports
            </span>
            <Clock className="w-5 h-5 text-forest-600" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-display">
            {activeCount}
          </div>
          <p className="text-[11px] text-charcoal-500">In verification or scheduled haul</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Waste Collected
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-display">
            {collectedCount}
          </div>
          <p className="text-[11px] text-charcoal-500">Hauled to processing center</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-terracotta-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Waste Recycled
            </span>
            <Recycle className="w-5 h-5 text-terracotta-600" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-display">
            {recycledCount}
          </div>
          <p className="text-[11px] text-charcoal-500">Converted into certified pavers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Est. CO₂ Mitigated
            </span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal-900 font-display">
            {impact ? (impact.total_co2_offset_kg / 1000).toFixed(1) : '10.2'} T
          </div>
          <p className="text-[11px] text-charcoal-500">Environmental equivalent offset</p>
        </div>
      </div>

      {/* Reports Section with Filter Bar */}
      <div className="bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-sand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Recent Construction Waste Reports</h2>
            <p className="text-xs text-charcoal-500">
              Click any report to view live tracking, AI composition analysis, and collection proof.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report ID, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs pl-3 pr-8 py-1.5 rounded-xl border border-sand-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 appearance-none font-medium text-charcoal-700"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AI_ANALYZED">AI Analyzed</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="COLLECTED">Collected</option>
                <option value="PROCESSING">Processing</option>
                <option value="RECYCLED">Recycled</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-charcoal-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-charcoal-400 space-y-2">
              <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <span>Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-charcoal-500 space-y-3">
              <FileText className="w-10 h-10 text-sand-400 mx-auto" />
              <p className="text-sm font-medium">No waste reports found.</p>
              <Link to="/report">
                <Button variant="secondary" size="sm">
                  Create First Report
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50/70 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-sand-200">
                <tr>
                  <th className="px-5 py-3">Report ID</th>
                  <th className="px-5 py-3">Waste Type</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 font-sans">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-sand-50/70 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-forest-800">
                      <Link to={`/reports/${report.id}`} className="hover:underline flex items-center gap-1.5">
                        <span>{report.id}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-charcoal-800">
                      {report.waste_type}
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-700 font-mono">
                      {report.estimated_quantity.toLocaleString()} {report.quantity_unit}
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-600 max-w-xs truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                        <span className="truncate">{report.address}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={report.priority} score={report.priority_score} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-500 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-forest-700 hover:text-forest-900 font-semibold group-hover:translate-x-0.5 transition"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
