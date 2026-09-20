import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { reportsApi } from '../../api/client';
import { WasteType } from '../../types';
import { Button } from '../../components/ui/Button';
import { MapPicker } from '../../components/shared/MapPicker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  UploadCloud,
  X,
  MapPin,
  Calendar,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  HardHat,
  Sparkles,
  Loader2
} from 'lucide-react';

export const ReportWasteWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State — images uploaded directly to Supabase Storage
  const [images, setImages] = useState<{ id: string; url: string; name: string; size: number; path?: string }[]>([]);

  const [wasteType, setWasteType] = useState<WasteType>('CONCRETE');
  const [isUncertainType, setIsUncertainType] = useState(false);
  const [quantity, setQuantity] = useState<number>(3500);
  const [unit, setUnit] = useState<'kg' | 'tons'>('kg');
  const [description, setDescription] = useState(
    'Demolished RCC lintels, broken compound wall bricks and loose mortar blocks requiring haul.'
  );

  const [lat, setLat] = useState(12.289);
  const [lng, setLng] = useState(76.628);
  const [address, setAddress] = useState('8th Main, Near Park, Kuvempunagar, Mysuru');
  const [landmark, setLandmark] = useState('Near Kuvempunagar Post Office');

  const [preferredDate, setPreferredDate] = useState('2026-09-20');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('09:00 - 12:00');
  const [contactPhone, setContactPhone] = useState('+91 98450 12345');
  const [pickupInstructions, setPickupInstructions] = useState(
    'Broad road access. Trucks up to 10 tons can reverse safely to the gate.'
  );

  // Image Upload Handler — uploads directly to Supabase Storage 'report-images'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!allowedTypes.includes(file.type)) {
          setErrorMsg(`File "${file.name}" is not supported. Only JPEG, PNG, and WebP images are allowed.`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setErrorMsg(`File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`);
          continue;
        }

        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `reports/${currentUser?.id || 'public'}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          setErrorMsg(`Upload failed for "${file.name}": ${uploadError.message}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(storagePath);

        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${i}`,
            url: publicUrlData.publicUrl,
            name: file.name,
            size: file.size,
            path: storagePath
          }
        ]);
      }
    } catch (err: any) {
      setErrorMsg(`Storage error: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && images.length === 0) {
      setErrorMsg('Please upload at least one photograph of the waste site.');
      return;
    }
    if (currentStep === 2 && (!quantity || quantity <= 0)) {
      setErrorMsg('Please enter a valid estimated quantity.');
      return;
    }
    if (currentStep === 3 && (!address || address.trim().length < 5)) {
      setErrorMsg('Please enter or select a valid address in Mysuru.');
      return;
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        waste_type: isUncertainType ? 'MIXED' : wasteType,
        estimated_quantity: Number(quantity),
        quantity_unit: unit,
        description: isUncertainType
          ? `[User Uncertain of Waste Type] ${description}`
          : description,
        latitude: lat,
        longitude: lng,
        address,
        landmark,
        preferred_pickup_date: preferredDate,
        preferred_pickup_time_slot: preferredTimeSlot,
        contact_phone: contactPhone,
        pickup_instructions: pickupInstructions,
        images: images.map((img) => ({
          image_url: img.url,
          file_size_bytes: img.size
        }))
      };

      const createdReport = await reportsApi.create(payload);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Navigate to tracker
      setTimeout(() => {
        navigate(`/reports/${createdReport.id}`);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: 'Upload Evidence' },
    { num: 2, title: 'Waste Details' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Pickup Timing' },
    { num: 5, title: 'Review & Submit' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {stepsMeta.map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                  currentStep === s.num
                    ? 'bg-forest-700 text-white ring-4 ring-forest-100'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-sand-300 text-charcoal-400'
                }`}
              >
                {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium hidden sm:block ${
                  currentStep === s.num ? 'text-forest-900 font-bold' : 'text-charcoal-400'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 w-full bg-sand-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest-700 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Upload Evidence */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-display">
                Step 1: Upload Photographic Evidence
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Upload clear photos of the demolition or construction rubble. Our AI prototype will estimate composition and recyclability.
              </p>
            </div>

            {/* Drag & Drop Upload Area */}
            <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition group ${
              isUploading
                ? 'border-forest-400 bg-forest-50/40 pointer-events-none'
                : 'border-sand-300 hover:border-forest-600 bg-sand-50/50 hover:bg-forest-50/20'
            }`}>
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-2" />
                  <span className="text-sm font-semibold text-charcoal-800">
                    Uploading photographs to Supabase Storage...
                  </span>
                  <span className="text-xs text-charcoal-400 mt-0.5">
                    Validating size and file integrity
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-sand-400 group-hover:text-forest-700 transition mb-2" />
                  <span className="text-sm font-semibold text-charcoal-800">
                    Click to upload or drag & drop files
                  </span>
                  <span className="text-xs text-charcoal-400 mt-0.5">
                    JPEG, PNG or WebP up to 10MB each
                  </span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-charcoal-700">
                  Uploaded Photographs ({images.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-xl overflow-hidden border border-sand-200 aspect-video group shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-charcoal-900/70 hover:bg-red-600 text-white transition shadow"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charcoal-900/80 to-transparent p-1.5 text-[10px] text-white truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Waste Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-display">
                Step 2: Waste Characteristics & Volume
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Select the primary material stream and estimate the approximate weight.
              </p>
            </div>

            {/* Waste Type Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal-800">Primary Waste Stream</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 'CONCRETE', label: 'Concrete & Slabs', desc: 'RCC, pillars, footings' },
                  { type: 'BRICKS', label: 'Clay Bricks', desc: 'Red bricks, clay blocks' },
                  { type: 'TILES', label: 'Ceramic / Tiles', desc: 'Flooring tiles, mosaics' },
                  { type: 'SOIL', label: 'Excavation Soil', desc: 'Foundation earth, murrum' },
                  { type: 'MIXED', label: 'Mixed Debris', desc: 'Unsorted demolition rubble' },
                  { type: 'OTHER', label: 'Other / Gypsum', desc: 'Plasterboard, drywall' }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setWasteType(item.type as WasteType);
                      setIsUncertainType(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      wasteType === item.type && !isUncertainType
                        ? 'border-forest-700 bg-forest-50/60 ring-2 ring-forest-600/30'
                        : 'border-sand-200 hover:border-sand-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-charcoal-900 block">{item.label}</span>
                    <span className="text-[10px] text-charcoal-500">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Uncertain Option */}
              <button
                type="button"
                onClick={() => setIsUncertainType(!isUncertainType)}
                className={`mt-2 w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                  isUncertainType
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-2 ring-purple-400/20'
                    : 'border-sand-200 text-charcoal-600 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>I don't know the exact waste type (Let AI classify on arrival)</span>
                </div>
                {isUncertainType && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </button>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800">
                  Estimated Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  placeholder="e.g. 3500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'kg' | 'tons')}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tons">Metric Tons (T)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-800">
                Detailed Site Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 leading-relaxed"
                placeholder="Describe source (e.g. house demolition, renovation) and site conditions..."
              />
            </div>
          </div>
        )}

        {/* STEP 3: Location */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-display">
                Step 3: Pin Location in Mysuru
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Select the exact debris accumulation point on the interactive map or use device GPS.
              </p>
            </div>

            {/* Interactive Map Picker */}
            <MapPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng, approxAddr) => {
                setLat(newLat);
                setLng(newLng);
                if (approxAddr) setAddress(approxAddr);
              }}
            />

            {/* Address Inputs */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  placeholder="e.g. 8th Main, Kuvempunagar, Mysuru"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800">
                  Landmark / Access Guide (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  placeholder="e.g. Opposite Kuvempunagar Library, near electrical substation"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Pickup Details */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-display">
                Step 4: Preferred Pickup Timing
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Let the collection crew know when the site is accessible for tipper vehicles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forest-700" />
                  Preferred Collection Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800">Preferred Time Slot</label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                >
                  <option value="07:00 - 10:00 (Early Morning)">07:00 - 10:00 (Early Morning)</option>
                  <option value="09:00 - 12:00 (Standard Morning)">09:00 - 12:00 (Standard Morning)</option>
                  <option value="12:00 - 15:00 (Afternoon)">12:00 - 15:00 (Afternoon)</option>
                  <option value="15:00 - 18:00 (Evening)">15:00 - 18:00 (Evening)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-forest-700" />
                Contact Phone for Driver Coordination
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                placeholder="+91 98450 12345"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-800">
                Vehicle Access Instructions
              </label>
              <textarea
                rows={2}
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 leading-relaxed"
                placeholder="Gate width, overhead power line clearance, road turning radius notes..."
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-display">
                Step 5: Review & Final Submission
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Please verify all waste details before submitting to the MCC collection registry.
              </p>
            </div>

            <div className="bg-sand-50/80 rounded-xl p-5 border border-sand-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Waste Stream
                  </span>
                  <span className="font-bold text-charcoal-900 text-sm">
                    {isUncertainType ? 'UNSORTED / PENDING AI' : wasteType}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Volume
                  </span>
                  <span className="font-bold text-charcoal-900 text-sm font-mono">
                    {quantity} {unit}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Target Date
                  </span>
                  <span className="font-bold text-charcoal-900">{preferredDate}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Photos
                  </span>
                  <span className="font-bold text-emerald-700">{images.length} Attached</span>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-200/80 space-y-2">
                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Location & Landmark
                  </span>
                  <p className="font-medium text-charcoal-800">
                    {address} {landmark && `(${landmark})`}
                  </p>
                  <p className="font-mono text-[11px] text-charcoal-500">
                    Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </p>
                </div>

                <div>
                  <span className="text-charcoal-400 block uppercase tracking-wider text-[10px] font-semibold">
                    Description & Access Instructions
                  </span>
                  <p className="text-charcoal-700 italic">"{description}"</p>
                  {pickupInstructions && (
                    <p className="text-charcoal-600 mt-1">Access: {pickupInstructions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI pipeline notice */}
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <span>
                Upon submission, our <strong>Prototype Computer Vision Engine</strong> will automatically evaluate aggregate composition, verify proximity to existing reports, and calculate priority.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-sand-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handleNext}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="button"
              variant="terracotta"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
              onClick={handleSubmitReport}
            >
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
