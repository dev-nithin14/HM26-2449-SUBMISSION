import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { analyticsApi, reportsApi, collectionsApi } from '../../api/client';
import { Report, CollectionTeam } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import {
  Shield,
  Clock,
  AlertTriangle,
  Truck,
  Recycle,
  MapPin,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useRealtimeSync, triggerLocalSync } from '../../hooks/useRealtimeSync';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [wasteDist, setWasteDist] = useState<Record<string, number>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [teams, setTeams] = useState<CollectionTeam[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [verifyModalReport, setVerifyModalReport] = useState<Report | null>(null);
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyNotes, setVerifyNotes] = useState('');

  const [dispatchModalReport, setDispatchModalReport] = useState<Report | null>(null);
  const [dispatchRoutingInfo, setDispatchRoutingInfo] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const [priorityModalReport, setPriorityModalReport] = useState<Report | null>(null);

  const loadData = async () => {
    try {
      const [ov, tr, wd, repList, teamList] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getTrends(),
        analyticsApi.getWaste(),
        reportsApi.getAll(),
        collectionsApi.getTeams()
      ]);
      setOverview(ov);
      setTrends(tr);
      setWasteDist(wd);
      setReports(repList);
      setTeams(teamList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useRealtimeSync(['reports', 'collection_assignments', 'processing_batches'], loadData);

  useEffect(() => {
    loadData();
  }, []);

  const openVerifyModal = (report: Report) => {
    setVerifyModalReport(report);
    setVerifyStatus('VERIFIED');
    setVerifyNotes('Verified compliant C&D waste accumulation point.');
  };

  const submitVerify = async () => {
    if (!verifyModalReport) return;
    setActionLoading(true);
    try {
      await reportsApi.verify(verifyModalReport.id, {
        status: verifyStatus,
        notes: verifyNotes
      });
      setVerifyModalReport(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const openDispatchModal = async (report: Report) => {
    setDispatchModalReport(report);
    setActionLoading(true);
    try {
      const routeInfo = await reportsApi.getRouting(report.id);
      setDispatchRoutingInfo(routeInfo);
      if (routeInfo.suggested_team?.id) {
        setSelectedTeamId(routeInfo.suggested_team.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitDispatch = async () => {
    if (!dispatchModalReport || !selectedTeamId) return;
    setActionLoading(true);
    try {
      await reportsApi.assign(dispatchModalReport.id, selectedTeamId);
      setDispatchModalReport(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  // Pie chart data
  const pieData = Object.entries(wasteDist).map(([key, value]) => ({
    name: key,
    value: Math.round(value / 1000) // in tons
  }));

  const COLORS = ['#245b41', '#c86d51', '#f59e0b', '#78716c', '#6366f1', '#a855f7'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 font-display">
              MCC Waste Operations Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">
              Administrator Desk
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time municipal grievance triage, algorithmic fleet routing, and circular recovery monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/map">
            <Button variant="secondary" size="sm" leftIcon={<MapPin className="w-4 h-4 text-forest-700" />}>
              Open GIS Map
            </Button>
          </Link>
          <Link to="/admin/hotspots">
            <Button variant="outline" size="sm" leftIcon={<Flame className="w-4 h-4 text-amber-600" />}>
              Hotspots
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm space-y-1">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold block">
            Total Reports
          </span>
          <div className="text-2xl font-extrabold text-charcoal-900 font-display">
            {overview?.totalReports || reports.length}
          </div>
          <span className="text-[10px] text-charcoal-400">All registered incidents</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-semibold block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Verification
          </span>
          <div className="text-2xl font-extrabold text-amber-900 font-display">
            {overview?.pendingVerification || 3}
          </div>
          <span className="text-[10px] text-amber-700">Requires desk review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm space-y-1">
          <span className="text-[10px] text-red-800 uppercase tracking-wider font-semibold block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            High / Critical
          </span>
          <div className="text-2xl font-extrabold text-red-900 font-display">
            {overview?.highPriority || 4}
          </div>
          <span className="text-[10px] text-red-700">Priority triage flags</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm space-y-1">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold block">
            Waste Collected
          </span>
          <div className="text-2xl font-extrabold text-forest-800 font-display">
            {overview?.totalCollectedTons || '42.5'} T
          </div>
          <span className="text-[10px] text-charcoal-400">Cleared from roads</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm space-y-1">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold block">
            Waste Recycled
          </span>
          <div className="text-2xl font-extrabold text-terracotta-600 font-display">
            {overview?.totalRecycledTons || '38.2'} T
          </div>
          <span className="text-[10px] text-charcoal-400">Manufactured into pavers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm space-y-1">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold block flex items-center gap-1">
            <Truck className="w-3 h-3 text-forest-600" />
            Active Fleets
          </span>
          <div className="text-2xl font-extrabold text-charcoal-900 font-display">
            {teams.length}
          </div>
          <span className="text-[10px] text-charcoal-400">Mysuru field units</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">
                Monthly Tonnage: Reported vs Recycled
              </h3>
              <p className="text-xs text-charcoal-500">
                Tracking municipal diversion progression over past 6 months
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-forest-700" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="month" fontSize={11} stroke="#78716c" />
                <YAxis fontSize={11} stroke="#78716c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="reportedTons" name="Debris Reported (Tons)" fill="#c86d51" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recycledTons" name="Material Recycled (Tons)" fill="#245b41" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">Debris Material Composition</h3>
            <p className="text-xs text-charcoal-500">Breakdown by material stream (Tons)</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Incident Registry Table */}
      <div className="bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-sand-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-charcoal-900">
              Actionable Report Dispatch & Verification Registry
            </h2>
            <p className="text-xs text-charcoal-500">
              Real-time operational triage: verify reports, review AI transparent priority factors, and assign collection crews.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50/70 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-sand-200">
              <tr>
                <th className="px-5 py-3">Report ID</th>
                <th className="px-5 py-3">Reporter</th>
                <th className="px-5 py-3">Material & Volume</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Priority Engine</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {reports.slice(0, 10).map((rep) => (
                <tr key={rep.id} className="hover:bg-sand-50/70 transition">
                  <td className="px-5 py-3 font-mono font-bold text-forest-800">
                    <Link to={`/reports/${rep.id}`} className="hover:underline">
                      {rep.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-charcoal-900 block">{rep.citizen_name}</span>
                    <span className="text-[11px] text-charcoal-400">{rep.citizen_phone}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-charcoal-800">{rep.waste_type}</span>
                    <span className="font-mono text-charcoal-500 block">
                      {rep.estimated_quantity.toLocaleString()} {rep.quantity_unit}
                    </span>
                  </td>
                  <td className="px-5 py-3 max-w-xs truncate text-charcoal-600">
                    {rep.address}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setPriorityModalReport(rep)}
                      className="text-left group"
                      title="Click to view scoring factors"
                    >
                      <PriorityBadge priority={rep.priority} score={rep.priority_score} showScore />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={rep.status} size="sm" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                    {/* Action 1: Verify */}
                    {['SUBMITTED', 'AI_ANALYZED', 'VERIFICATION_PENDING'].includes(rep.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openVerifyModal(rep)}
                        leftIcon={<Shield className="w-3.5 h-3.5 text-forest-700" />}
                      >
                        Verify
                      </Button>
                    )}

                    {/* Action 2: Dispatch */}
                    {rep.status === 'VERIFIED' && (
                      <Button
                        variant="terracotta"
                        size="sm"
                        onClick={() => openDispatchModal(rep)}
                        leftIcon={<Truck className="w-3.5 h-3.5" />}
                      >
                        Assign Crew
                      </Button>
                    )}

                    <Link to={`/reports/${rep.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyModalReport && (
        <Modal
          isOpen={Boolean(verifyModalReport)}
          onClose={() => setVerifyModalReport(null)}
          title={`Verify Waste Report — ${verifyModalReport.id}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-charcoal-600">
              Audit the photographic evidence and location for report{' '}
              <strong className="text-charcoal-900">{verifyModalReport.id}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Verification Outcome</label>
              <div className="grid grid-cols-3 gap-2">
                {['VERIFIED', 'POSSIBLE_DUPLICATE', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setVerifyStatus(st)}
                    className={`p-2 rounded-xl border text-center font-bold transition ${
                      verifyStatus === st
                        ? 'bg-forest-700 text-white border-forest-800'
                        : 'bg-sand-50 text-charcoal-700 hover:bg-sand-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Admin Audit Notes</label>
              <textarea
                rows={3}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setVerifyModalReport(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={submitVerify}
              >
                Submit Verification
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispatch Fleet Modal */}
      {dispatchModalReport && (
        <Modal
          isOpen={Boolean(dispatchModalReport)}
          onClose={() => setDispatchModalReport(null)}
          title={`Dispatch Collection Team — ${dispatchModalReport.id}`}
        >
          <div className="space-y-4 text-xs">
            {dispatchRoutingInfo && (
              <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 leading-relaxed">
                <span className="font-bold block mb-1">Geospatial Recommendation:</span>
                <p>{dispatchRoutingInfo.routing_note}</p>
                <p className="mt-1 font-mono text-[11px] text-forest-700">
                  Approx. Distance: {dispatchRoutingInfo.approximate_distance_km} km
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Available Fleets</label>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {teams.map((t) => (
                  <label
                    key={t.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedTeamId === t.id
                        ? 'border-forest-700 bg-forest-50/70 ring-2 ring-forest-600/30'
                        : 'border-sand-200 hover:bg-sand-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-charcoal-900 block">{t.team_name}</span>
                      <span className="text-charcoal-500">
                        {t.lead_driver_name} • {t.vehicle_number} • Capacity: {t.vehicle_capacity_tons}T
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="team-admin"
                      value={t.id}
                      checked={selectedTeamId === t.id}
                      onChange={() => setSelectedTeamId(t.id)}
                      className="text-forest-700 focus:ring-forest-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDispatchModalReport(null)}>
                Cancel
              </Button>
              <Button
                variant="terracotta"
                size="sm"
                isLoading={actionLoading}
                onClick={submitDispatch}
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Priority Reasons Modal */}
      {priorityModalReport && (
        <Modal
          isOpen={Boolean(priorityModalReport)}
          onClose={() => setPriorityModalReport(null)}
          title={`Priority Breakdown — ${priorityModalReport.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-sand-50 p-3 rounded-xl border border-sand-200">
              <div>
                <span className="text-charcoal-500 font-medium block">Calculated Level</span>
                <span className="font-bold text-sm text-charcoal-900">{priorityModalReport.priority}</span>
              </div>
              <div className="text-right">
                <span className="text-charcoal-500 font-medium block">Score</span>
                <span className="font-mono font-bold text-terracotta-700 text-lg">
                  {priorityModalReport.priority_score} / 100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-charcoal-900 uppercase tracking-wider text-[11px] block">
                Algorithmic Factors Evaluated
              </span>
              <ul className="space-y-2">
                {priorityModalReport.priority_reasons?.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-sand-200">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <span className="text-charcoal-700 leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPriorityModalReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
