import React, { useState, useEffect } from 'react';
import { collectionsApi } from '../../api/client';
import { CollectionAssignment } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Navigation,
  Upload,
  UploadCloud,
  Scale,
  Camera,
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useRealtimeSync, triggerLocalSync } from '../../hooks/useRealtimeSync';
import { supabase } from '../../lib/supabase';

export const CollectionDashboard: React.FC = () => {
  const { activeRole } = useAuth();
  const [assignments, setAssignments] = useState<CollectionAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Proof Modal state
  const [proofModalAssignment, setProofModalAssignment] = useState<CollectionAssignment | null>(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [verifiedWeight, setVerifiedWeight] = useState<number>(3400);
  const [driverNotes, setDriverNotes] = useState(
    'Site cleared completely. Loaded onto 10-Ton tipper. Weighed at Mysore APMC weighbridge.'
  );

  const fetchAssignments = async () => {
    try {
      const data = await collectionsApi.getAll();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useRealtimeSync(['collection_assignments', 'reports'], fetchAssignments);

  useEffect(() => {
    fetchAssignments();
  }, [activeRole]);

  const handleAccept = async (assignmentId: string) => {
    setActionLoading(true);
    try {
      await collectionsApi.update(assignmentId, 'ACCEPTED', 'Driver accepted collection assignment.');
      triggerLocalSync('collection_assignments');
      await fetchAssignments();
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTransit = async (assignmentId: string) => {
    setActionLoading(true);
    try {
      await collectionsApi.update(assignmentId, 'IN_TRANSIT', 'Tipper truck in transit to site.');
      await fetchAssignments();
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenProofModal = (assignment: CollectionAssignment) => {
    setProofModalAssignment(assignment);
    setProofPhotoUrl('');
    setProofError(null);
    const est = assignment.report?.estimated_quantity || 3000;
    setVerifiedWeight(est);
  };

  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !proofModalAssignment) return;

    setProofError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setProofError('Unsupported file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProofError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`);
      return;
    }

    setIsUploadingProof(true);
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `proofs/${proofModalAssignment.id}/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from('collection-proofs')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        setProofError(`Proof upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('collection-proofs')
        .getPublicUrl(storagePath);

      setProofPhotoUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      setProofError(`Storage upload error: ${err.message}`);
    } finally {
      setIsUploadingProof(false);
      e.target.value = '';
    }
  };

  const handleSubmitProof = async () => {
    if (!proofModalAssignment) return;
    if (!proofPhotoUrl) {
      setProofError('Please upload a collection proof photograph or specify a valid proof URL.');
      return;
    }

    setActionLoading(true);
    setProofError(null);
    try {
      await collectionsApi.submitProof(proofModalAssignment.id, {
        photo_url: proofPhotoUrl,
        verified_weight_kg: Number(verifiedWeight),
        gps_latitude: proofModalAssignment.report?.latitude || 12.289,
        gps_longitude: proofModalAssignment.report?.longitude || 76.628,
        driver_notes: driverNotes
      });
      setProofModalAssignment(null);
      await fetchAssignments();
    } catch (err: any) {
      setProofError(err.message || 'Failed to submit proof');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 font-display">
              Field Collection Dispatch
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">
              Live Fleet Queue
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Accept dispatches, navigate to Mysuru rubble sites, and log verified weighbridge receipts with photo proof.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignments}
            isLoading={isLoading}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-charcoal-400">
          <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading collection queue...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-sand-200 text-center space-y-3">
          <Truck className="w-10 h-10 text-sand-400 mx-auto" />
          <h3 className="text-sm font-semibold text-charcoal-700">No Active Collections</h3>
          <p className="text-xs text-charcoal-500">All assigned jobs have been completed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const report = assignment.report;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-sand-100 flex items-center justify-between bg-sand-50/50">
                    <div>
                      <span className="font-mono text-xs font-bold text-charcoal-900">
                        {assignment.id}
                      </span>
                      <p className="text-[11px] text-charcoal-500">
                        Target Report: <strong className="text-forest-800">{assignment.report_id}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {report && <PriorityBadge priority={report.priority} />}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          assignment.status === 'COLLECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : assignment.status === 'IN_TRANSIT'
                            ? 'bg-amber-100 text-amber-800'
                            : assignment.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-sand-200 text-charcoal-700'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold block">
                          Assigned Fleet Unit
                        </span>
                        <span className="font-bold text-charcoal-800">
                          {assignment.collection_team_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold block">
                          Approx. Distance
                        </span>
                        <span className="font-bold font-mono text-terracotta-700">
                          {assignment.distance_km ? `${assignment.distance_km} km` : '3.8 km'}
                        </span>
                      </div>
                    </div>

                    {report && (
                      <div className="space-y-2 pt-2 border-t border-sand-100">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-charcoal-900">{report.address}</p>
                            {report.landmark && (
                              <p className="text-charcoal-500">Landmark: {report.landmark}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between py-1 border-b border-sand-100/60">
                          <span className="text-charcoal-500">Material Stream</span>
                          <span className="font-bold text-charcoal-900">{report.waste_type}</span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-charcoal-500">Estimated Load</span>
                          <span className="font-bold font-mono text-charcoal-900">
                            {report.estimated_quantity.toLocaleString()} {report.quantity_unit}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Show Proof if already completed */}
                    {assignment.proof && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-emerald-900 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            Collection Proof Verified
                          </span>
                          <span className="font-mono font-bold">
                            {assignment.proof.verified_weight_kg} kg
                          </span>
                        </div>
                        {assignment.proof.driver_notes && (
                          <p className="text-[11px] text-emerald-800 italic">
                            "{assignment.proof.driver_notes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-sand-50/70 border-t border-sand-100 flex flex-wrap items-center justify-end gap-2">
                  {assignment.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccept(assignment.id)}
                      isLoading={actionLoading}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Accept Assignment
                    </Button>
                  )}

                  {assignment.status === 'ACCEPTED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartTransit(assignment.id)}
                      isLoading={actionLoading}
                      leftIcon={<Navigation className="w-4 h-4 text-forest-700" />}
                    >
                      Start Collection Transit
                    </Button>
                  )}

                  {assignment.status === 'IN_TRANSIT' && (
                    <Button
                      variant="terracotta"
                      size="sm"
                      onClick={() => handleOpenProofModal(assignment)}
                      leftIcon={<Camera className="w-4 h-4" />}
                    >
                      Mark Collected & Upload Proof
                    </Button>
                  )}

                  {assignment.status === 'COLLECTED' && (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 py-1">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Haul Cleared & Logged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Collection Proof Modal */}
      <Modal
        isOpen={Boolean(proofModalAssignment)}
        onClose={() => setProofModalAssignment(null)}
        title="Complete Collection & Upload Proof"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal-600">
            Confirm the physical collection and record the weighbridge verified load ticket for{' '}
            <strong className="text-charcoal-900">{proofModalAssignment?.report_id}</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-forest-700" />
              Verified Weighbridge Weight (kg)
            </label>
            <input
              type="number"
              value={verifiedWeight}
              onChange={(e) => setVerifiedWeight(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-sand-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              placeholder="e.g. 3450"
            />
          </div>

          {proofError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{proofError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-forest-700" />
                Upload Weighbridge / Site Clearance Photo Proof
              </span>
              <span className="text-[10px] text-charcoal-400 font-normal">Max 10MB (JPEG, PNG, WebP)</span>
            </label>

            {/* Storage File Upload Area */}
            <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
              isUploadingProof
                ? 'border-forest-400 bg-forest-50/40 pointer-events-none'
                : 'border-sand-300 hover:border-forest-600 bg-sand-50/50 hover:bg-forest-50/20'
            }`}>
              {isUploadingProof ? (
                <div className="flex items-center gap-2 py-2 text-forest-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-semibold">Uploading proof to Supabase Storage...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2 text-charcoal-600">
                  <UploadCloud className="w-5 h-5 text-sand-500" />
                  <span className="text-xs font-medium">Click to select photo or drag and drop</span>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProofFileUpload}
                disabled={isUploadingProof}
                className="hidden"
              />
            </label>

            {proofPhotoUrl && (
              <div className="space-y-1.5 mt-2">
                <div className="h-32 rounded-xl overflow-hidden border border-sand-200 shadow-sm relative group">
                  <img
                    src={proofPhotoUrl}
                    alt="Proof Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-charcoal-900/60 backdrop-blur-xs px-2.5 py-1 text-[10px] text-white truncate font-mono">
                    {proofPhotoUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800">Field Driver Observations</label>
            <textarea
              rows={2}
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProofModalAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="terracotta"
              size="sm"
              isLoading={actionLoading}
              onClick={handleSubmitProof}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Proof & Clear Site
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
