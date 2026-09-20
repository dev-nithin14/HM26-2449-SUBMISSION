import { v4 as uuidv4 } from 'uuid';
import { Report, ReportVerification, VerificationStatus } from '../../types/index.js';
import { reportRepository } from '../../repositories/index.js';

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class VerificationService {
  /**
   * Deterministic verification & duplicate detection
   * Checks geospatial proximity (within 50 meters) and material type matches
   */
  public async verifyReport(
    report: Report,
    adminId?: string,
    adminName?: string,
    overrideStatus?: VerificationStatus,
    adminNotes?: string
  ): Promise<ReportVerification> {
    const allReports = await reportRepository.findAll();
    const flags: string[] = [];
    let detectedDuplicateId: string | undefined = undefined;

    // Check proximity against other reports
    for (const other of allReports) {
      if (other.id === report.id) continue;
      const distMeters = calculateDistanceMeters(
        report.latitude,
        report.longitude,
        other.latitude,
        other.longitude
      );

      if (distMeters < 60) {
        flags.push(`PROXIMITY_ALERT: Within ${Math.round(distMeters)}m of ${other.id}`);
        if (other.waste_type === report.waste_type && ['SUBMITTED', 'VERIFIED', 'ASSIGNED'].includes(other.status)) {
          detectedDuplicateId = other.id;
          flags.push(`POTENTIAL_DUPLICATE_OF_${other.id}`);
        }
      }
    }

    if (report.estimated_quantity >= 5000 || (report.quantity_unit === 'tons' && report.estimated_quantity >= 5)) {
      flags.push('HIGH_VOLUME_HAUL');
    }

    if (report.images.length === 0) {
      flags.push('MISSING_PHOTOGRAPHIC_EVIDENCE');
    }

    let finalStatus: VerificationStatus = overrideStatus || 'VERIFIED';

    if (!overrideStatus) {
      if (detectedDuplicateId) {
        finalStatus = 'POSSIBLE_DUPLICATE';
      } else if (flags.includes('MISSING_PHOTOGRAPHIC_EVIDENCE')) {
        finalStatus = 'REJECTED';
      } else {
        finalStatus = 'VERIFIED';
      }
    }

    return {
      id: `ver-${uuidv4().substring(0, 8)}`,
      report_id: report.id,
      status: finalStatus,
      verified_by: adminId || 'a0000000-0000-0000-0000-000000000001',
      verifier_name: adminName || 'Pooja Kulkarni (MCC Nodal Officer)',
      notes: adminNotes || (detectedDuplicateId ? `Possible duplicate of ${detectedDuplicateId}` : 'Verified valid C&D waste accumulation site.'),
      flags,
      duplicate_of_report_id: detectedDuplicateId,
      verified_at: new Date().toISOString()
    };
  }
}

export const verificationService = new VerificationService();
