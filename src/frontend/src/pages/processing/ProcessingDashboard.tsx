import React, { useState, useEffect } from 'react';
import { processingApi, reportsApi } from '../../api/client';
import { ProcessingBatch, RecycledProduct, Report, WasteType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Cog,
  Recycle,
  Layers,
  PlusCircle,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Filter,
  Scale,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useRealtimeSync, triggerLocalSync } from '../../hooks/useRealtimeSync';

export const ProcessingDashboard: React.FC = () => {
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [products, setProducts] = useState<RecycledProduct[]>([]);
  const [collectedReports, setCollectedReports] = useState<Report[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProcessingBatch | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create Batch Modal
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [batchMaterialType, setBatchMaterialType] = useState<WasteType>('CONCRETE');
  const [batchIntakeKg, setBatchIntakeKg] = useState<number>(5000);
  const [batchNotes, setBatchNotes] = useState(
    'Intake for secondary jaw crushing and vibrating screen aggregate recovery.'
  );

  // Record Recovery & Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [recoveredKg, setRecoveredKg] = useState<number>(4500);
  const [rejectedKg, setRejectedKg] = useState<number>(500);
  const [productType, setProductType] = useState<
    'Recycled Paver' | 'Recycled Construction Block' | 'Coarse Aggregate' | 'Manufactured Sand'
  >('Recycled Paver');
  const [unitsProduced, setUnitsProduced] = useState<number>(1200);
  const [unitOfMeasure, setUnitOfMeasure] = useState<'units' | 'sq_meters' | 'tons'>('units');
  const [prototypeCost, setPrototypeCost] = useState<number>(28);
  const [intendedApp, setIntendedApp] = useState('Pedestrian pathways & heritage park walkways in Mysuru');

  const loadAll = async () => {
    try {
      const [batchList, prodList, repList] = await Promise.all([
        processingApi.getBatches(),
        processingApi.getProducts(),
        reportsApi.getAll({ status: 'COLLECTED' })
      ]);
      setBatches(batchList);
      setProducts(prodList);
      setCollectedReports(repList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useRealtimeSync(['processing_batches', 'reports'], loadAll);

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateBatch = async () => {
    if (selectedReportIds.length === 0) {
      alert('Please select at least one source report from the intake queue.');
      return;
    }
    setActionLoading(true);
    try {
      await processingApi.createBatch({
        source_report_ids: selectedReportIds,
        intake_quantity_kg: Number(batchIntakeKg),
        material_type: batchMaterialType,
        notes: batchNotes
      });
      setShowCreateBatchModal(false);
      setSelectedReportIds([]);
      await loadAll();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!targetBatchId) return;
    setActionLoading(true);
    try {
      await processingApi.createProduct({
        batch_id: targetBatchId,
        product_name: productType,
        units_produced: Number(unitsProduced),
        unit_of_measure: unitOfMeasure,
        recycled_content_percentage: 85,
        dimensions_mm:
          productType === 'Recycled Paver' ? '200 x 100 x 60 mm' : '400 x 200 x 200 mm',
        prototype_unit_cost_inr: Number(prototypeCost),
        intended_application: intendedApp,
        production_status: 'PILOT'
      });
      setShowProductModal(false);
      await loadAll();
    } finally {
      setActionLoading(false);
    }
  };

  const toggleReportSelection = (rep: Report) => {
    setSelectedReportIds((prev) => {
      const exists = prev.includes(rep.id);
      if (exists) {
        return prev.filter((id) => id !== rep.id);
      } else {
        const next = [...prev, rep.id];
        // update estimated intake
        const currentSum = collectedReports
          .filter((r) => next.includes(r.id))
          .reduce((sum, r) => sum + (r.quantity_unit === 'tons' ? r.estimated_quantity * 1000 : r.estimated_quantity), 0);
        setBatchIntakeKg(currentSum);
        setBatchMaterialType(rep.waste_type);
        return next;
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 font-display">
              Processing & Material Recovery Facility
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">
              Hebbal Eco-Aggregates Center
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Aggregate intake, mechanical sorting, jaw crushing, and manufacturing circular civic products.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setShowCreateBatchModal(true)}
        >
          Create Processing Batch
        </Button>
      </div>

      {/* Available Collected Reports Queue */}
      <div className="bg-sand-50/80 p-5 rounded-2xl border border-sand-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-forest-700" />
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Collected Rubble Awaiting Batching ({collectedReports.length})
            </h3>
          </div>
          <span className="text-[11px] text-charcoal-500">
            Hauled by field fleet and offloaded at processing hopper
          </span>
        </div>

        {collectedReports.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic">No unbatched collected materials currently in hopper.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {collectedReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => toggleReportSelection(rep)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                  selectedReportIds.includes(rep.id)
                    ? 'border-forest-700 bg-forest-50/70 ring-2 ring-forest-600/30'
                    : 'bg-white border-sand-200 hover:border-sand-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-forest-800">{rep.id}</span>
                  <span className="font-semibold text-charcoal-700">{rep.waste_type}</span>
                </div>
                <p className="text-charcoal-500 truncate">{rep.address}</p>
                <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                  <span>{rep.estimated_quantity.toLocaleString()} {rep.quantity_unit}</span>
                  <span className="text-forest-700 font-semibold">
                    {selectedReportIds.includes(rep.id) ? '✓ Selected' : '+ Select for Batch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Batches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal-900">Processing Batches</h2>
          <span className="text-xs text-charcoal-500">
            Click a batch to inspect full traceability genealogy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-sand-50/60 border-b border-sand-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cog className="w-4 h-4 text-forest-700" />
                    <span className="font-mono font-bold text-sm text-charcoal-900">{batch.id}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      batch.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : batch.status === 'RECOVERY'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                        Input Material
                      </span>
                      <span className="font-bold text-charcoal-800">{batch.material_type}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                        Gross Intake
                      </span>
                      <span className="font-bold font-mono text-charcoal-900">
                        {batch.intake_quantity_kg.toLocaleString()} kg
                      </span>
                    </div>
                  </div>

                  {/* Recovery Metric */}
                  <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>Recovery Yield</span>
                      <span className="text-forest-700">{batch.recovery_rate_percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-sand-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${batch.recovery_rate_percentage}%` }}
                        className="bg-forest-600 h-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-charcoal-500 font-mono pt-0.5">
                      <span>Recovered: {batch.recovered_quantity_kg.toLocaleString()} kg</span>
                      <span>Reject: {batch.rejected_quantity_kg.toLocaleString()} kg</span>
                    </div>
                  </div>

                  {/* Traceability Link: Source Reports */}
                  <div>
                    <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold mb-1">
                      Source Report Provenance
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {batch.source_report_ids.map((repId) => (
                        <span
                          key={repId}
                          className="px-2 py-0.5 rounded bg-sand-100 text-charcoal-700 font-mono text-[11px] border border-sand-200"
                        >
                          {repId}
                        </span>
                      ))}
                    </div>
                  </div>

                  {batch.notes && (
                    <p className="text-[11px] text-charcoal-600 italic bg-sand-50/50 p-2 rounded">
                      "{batch.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-sand-50/70 border-t border-sand-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedBatch(batch)}
                  className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Trace Genealogy</span>
                </button>

                {batch.status !== 'COMPLETED' && (
                  <Button
                    variant="terracotta"
                    size="sm"
                    onClick={() => {
                      setTargetBatchId(batch.id);
                      setRecoveredKg(batch.recovered_quantity_kg);
                      setRejectedKg(batch.rejected_quantity_kg);
                      setShowProductModal(true);
                    }}
                    leftIcon={<Recycle className="w-3.5 h-3.5" />}
                  >
                    Produce Pavers
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recycled Products Inventory */}
      <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-charcoal-900">
              Recovered Secondary Products Catalog
            </h2>
            <p className="text-xs text-charcoal-500">
              Final manufactured materials linking back to C&D processing batches.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 font-semibold">
            {products.length} Products in Inventory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-4 rounded-xl border border-sand-200 bg-sand-50/40 space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-charcoal-900 text-sm">{prod.product_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {prod.production_status}
                </span>
              </div>
              <div className="text-charcoal-600 space-y-1">
                <p>
                  Batch Lineage: <strong className="font-mono text-forest-800">{prod.batch_id}</strong>
                </p>
                <p>
                  Volume Produced: <strong className="text-charcoal-900">{prod.units_produced} {prod.unit_of_measure}</strong>
                </p>
                <p>Recycled Content: <strong>{prod.recycled_content_percentage}%</strong></p>
                <p>Pilot Unit Cost: <strong>₹{prod.prototype_unit_cost_inr}</strong></p>
              </div>
              <p className="text-[11px] text-charcoal-500 italic pt-1 border-t border-sand-200">
                Application: {prod.intended_application}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Processing Batch Modal */}
      <Modal
        isOpen={showCreateBatchModal}
        onClose={() => setShowCreateBatchModal(false)}
        title="Initiate Processing Batch"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal-600">
            Combine collected rubble reports into a single mechanical processing batch for jaw crushing and vibratory sorting.
          </p>

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800">
              Select Source Reports ({selectedReportIds.length} Selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-sand-200 rounded-xl p-2 bg-sand-50/50">
              {collectedReports.length === 0 ? (
                <p className="text-charcoal-400 italic p-2">No collected reports available.</p>
              ) : (
                collectedReports.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-sand-200 cursor-pointer hover:bg-sand-100"
                  >
                    <div>
                      <span className="font-mono font-bold text-forest-800">{r.id}</span>
                      <span className="text-charcoal-600 ml-2">
                        ({r.waste_type}, {r.estimated_quantity} {r.quantity_unit})
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedReportIds.includes(r.id)}
                      onChange={() => toggleReportSelection(r)}
                      className="rounded text-forest-700 focus:ring-forest-600"
                    />
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Gross Intake (kg)</label>
              <input
                type="number"
                value={batchIntakeKg}
                onChange={(e) => setBatchIntakeKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Dominant Stream</label>
              <select
                value={batchMaterialType}
                onChange={(e) => setBatchMaterialType(e.target.value as WasteType)}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
              >
                <option value="CONCRETE">CONCRETE</option>
                <option value="BRICKS">BRICKS</option>
                <option value="TILES">TILES</option>
                <option value="MIXED">MIXED</option>
                <option value="SOIL">SOIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800">Batch Processing Directives</label>
            <textarea
              rows={2}
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateBatchModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={handleCreateBatch}
            >
              Start Batch Processing
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Record Material Recovery & Manufactured Product"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal-600">
            Finalize processing for batch <strong className="font-mono text-charcoal-900">{targetBatchId}</strong> and record circular output product inventory.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Recovered Yield (kg)</label>
              <input
                type="number"
                value={recoveredKg}
                onChange={(e) => setRecoveredKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Rejected Contaminants (kg)</label>
              <input
                type="number"
                value={rejectedKg}
                onChange={(e) => setRejectedKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Product Manufactured</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
              >
                <option value="Recycled Paver">Recycled Paver</option>
                <option value="Recycled Construction Block">Recycled Construction Block</option>
                <option value="Coarse Aggregate">Coarse Aggregate (20mm)</option>
                <option value="Manufactured Sand">Manufactured Sand (M-Sand)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-charcoal-800">Units / Output</label>
              <input
                type="number"
                value={unitsProduced}
                onChange={(e) => setUnitsProduced(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-sand-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-charcoal-800">Intended Civic Application</label>
            <input
              type="text"
              value={intendedApp}
              onChange={(e) => setIntendedApp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowProductModal(false)}>
              Cancel
            </Button>
            <Button
              variant="terracotta"
              size="sm"
              isLoading={actionLoading}
              onClick={handleCreateProduct}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Finalize Recovery & Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Traceability Genealogy Modal */}
      {selectedBatch && (
        <Modal
          isOpen={Boolean(selectedBatch)}
          onClose={() => setSelectedBatch(null)}
          title={`Traceability Chain — ${selectedBatch.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="bg-sand-50 p-4 rounded-xl border border-sand-200 space-y-3">
              <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[11px]">
                Circular Value Chain Topology
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-charcoal-700">
                <span className="px-2.5 py-1 rounded bg-white font-mono border border-sand-300 font-bold">
                  {selectedBatch.source_report_ids.join(', ')}
                </span>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
                <span className="px-2.5 py-1 rounded bg-forest-100 font-mono border border-forest-300 font-bold text-forest-900">
                  {selectedBatch.id}
                </span>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
                <span className="px-2.5 py-1 rounded bg-purple-100 font-semibold border border-purple-300 text-purple-900">
                  {selectedBatch.recovered_quantity_kg} kg Recovery
                </span>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
                <span className="px-2.5 py-1 rounded bg-terracotta-100 font-bold border border-terracotta-300 text-terracotta-900">
                  Recycled Civic Pavers
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold text-charcoal-800">Source Report Breakdown</h5>
              <div className="space-y-2">
                {selectedBatch.source_report_ids.map((repId) => (
                  <div
                    key={repId}
                    className="p-3 rounded-lg border border-sand-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-forest-800">{repId}</span>
                      <p className="text-charcoal-500">Collected from Mysuru field site</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      RECYCLED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
