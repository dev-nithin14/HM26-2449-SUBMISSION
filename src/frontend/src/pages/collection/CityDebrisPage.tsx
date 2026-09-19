import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { reportsApi } from '../../api/client';
import { Report } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MapPin, RefreshCw, Truck } from 'lucide-react';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

export const CityDebrisPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setReports(await reportsApi.getAll());
    } catch (error) {
      console.error('Failed to fetch city debris reports', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === 'COLLECTION_TEAM') {
      loadReports();
    }
  }, [activeRole]);

  if (activeRole !== 'COLLECTION_TEAM') {
    return <Navigate to="/overview" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 font-display">
              City Debris
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">
              Collection View
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Review reported construction and demolition debris before dispatch and collection.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadReports}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Reports
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-charcoal-400">
          <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading city debris reports...</span>
        </div>
      ) : hasError ? (
        <div className="bg-white p-12 rounded-2xl border border-sand-200 text-center space-y-3">
          <h2 className="text-sm font-semibold text-charcoal-800">Reports could not be loaded</h2>
          <p className="text-xs text-charcoal-500">Check the connection to the report service and try again.</p>
          <Button variant="secondary" size="sm" onClick={loadReports}>
            Try Again
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-sand-200 text-center space-y-3">
          <Truck className="w-10 h-10 text-sand-400 mx-auto" />
          <h2 className="text-sm font-semibold text-charcoal-800">No debris reports found</h2>
          <p className="text-xs text-charcoal-500">New construction and demolition reports will appear here.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-[10px] uppercase tracking-wider text-charcoal-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Report</th>
                    <th className="px-5 py-3 font-semibold">Location</th>
                    <th className="px-5 py-3 font-semibold">Material</th>
                    <th className="px-5 py-3 font-semibold">Reported</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Assigned Crew</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-sand-50/60 transition">
                      <td className="px-5 py-4 align-top">
                        <Link to={`/reports/${report.id}`} className="font-mono font-bold text-forest-800 hover:text-forest-950">
                          {report.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4 align-top min-w-[260px]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-charcoal-800">{report.address}</p>
                            {report.landmark && <p className="text-charcoal-500 mt-0.5">{report.landmark}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="font-semibold text-charcoal-800">{report.waste_type}</span>
                        <span className="block text-charcoal-500 mt-0.5">{report.estimated_quantity.toLocaleString()} {report.quantity_unit}</span>
                      </td>
                      <td className="px-5 py-4 align-top whitespace-nowrap text-charcoal-600">{formatDate(report.created_at)}</td>
                      <td className="px-5 py-4 align-top"><StatusBadge status={report.status} size="sm" /></td>
                      <td className="px-5 py-4 align-top"><PriorityBadge priority={report.priority} /></td>
                      <td className="px-5 py-4 align-top text-charcoal-700">{report.assigned_collection_team_name || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {reports.map((report) => (
              <article key={report.id} className="bg-white rounded-2xl border border-sand-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link to={`/reports/${report.id}`} className="font-mono text-xs font-bold text-forest-800 hover:text-forest-950">
                    {report.id}
                  </Link>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={report.priority} />
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal-800">{report.address}</p>
                    {report.landmark && <p className="text-xs text-charcoal-500 mt-0.5">{report.landmark}</p>}
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 border-t border-sand-100 pt-3 text-xs">
                  <div>
                    <dt className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold">Material</dt>
                    <dd className="font-semibold text-charcoal-800 mt-1">{report.waste_type}</dd>
                  </div>
                  <div>
                    <dt className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold">Reported</dt>
                    <dd className="font-semibold text-charcoal-800 mt-1">{formatDate(report.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold">Estimated Load</dt>
                    <dd className="font-semibold text-charcoal-800 mt-1">{report.estimated_quantity.toLocaleString()} {report.quantity_unit}</dd>
                  </div>
                  <div>
                    <dt className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold">Assigned Crew</dt>
                    <dd className="font-semibold text-charcoal-800 mt-1">{report.assigned_collection_team_name || 'Unassigned'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
