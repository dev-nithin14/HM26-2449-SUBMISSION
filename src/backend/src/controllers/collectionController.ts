import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  collectionRepository,
  reportRepository,
  notificationRepository
} from '../repositories/index.js';
import {
  UpdateCollectionAssignmentSchema,
  SubmitCollectionProofSchema
} from '../validators/index.js';
import { uploadCollectionProof } from '../services/storage/storageService.js';

export async function getAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    const { team_id } = req.query;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const assignments = await collectionRepository.findAllAssignments(team_id as string, token);
    return res.json({
      success: true,
      data: assignments
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ASSIGNMENTS_FAILED', message: err.message }
    });
  }
}

export async function getAssignmentById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const assignment = await collectionRepository.findAssignmentById(id, token);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Assignment ${id} not found` }
      });
    }

    return res.json({
      success: true,
      data: assignment
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_ASSIGNMENT_FAILED', message: err.message }
    });
  }
}

export async function updateAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const validated = UpdateCollectionAssignmentSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const assignment = await collectionRepository.findAssignmentById(id, token);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Assignment ${id} not found` }
      });
    }

    const updates: any = { status: validated.status };
    if (validated.status === 'ACCEPTED') {
      updates.accepted_at = new Date().toISOString();
    } else if (validated.status === 'IN_TRANSIT') {
      updates.started_at = new Date().toISOString();
    }

    const updated = await collectionRepository.updateAssignment(id, updates, token);

    // If starting collection, log timeline on report
    if (validated.status === 'IN_TRANSIT') {
      await reportRepository.addTimelineEvent(assignment.report_id, {
        status: 'ASSIGNED',
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: 'COLLECTION_TEAM',
        note: `Collection team dispatched and in transit to site.`
      }, token);
    }

    return res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'UPDATE_ASSIGNMENT_FAILED', message: err.message }
    });
  }
}

export async function submitCollectionProof(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const validated = SubmitCollectionProofSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    const assignment = await collectionRepository.findAssignmentById(id, token);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Assignment ${id} not found` }
      });
    }

    let photoUrl = validated.photo_url;
    if (photoUrl.startsWith('data:')) {
      const uploadResult = await uploadCollectionProof(
        photoUrl,
        `proof_${id}.jpg`,
        id,
        token
      );
      photoUrl = uploadResult.publicUrl;
    }

    const proof = await collectionRepository.submitProof(id, {
      photo_url: photoUrl,
      verified_weight_kg: validated.verified_weight_kg,
      gps_latitude: validated.gps_latitude,
      gps_longitude: validated.gps_longitude,
      driver_notes: validated.driver_notes
    }, token);

    // Update report status to COLLECTED
    await reportRepository.update(assignment.report_id, {
      status: 'COLLECTED'
    }, token);

    await reportRepository.addTimelineEvent(assignment.report_id, {
      status: 'COLLECTED',
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: 'COLLECTION_TEAM',
      note: `Waste physically collected and cleared. Verified gross load: ${validated.verified_weight_kg} kg. Photo proof uploaded.`
    }, token);

    // Notify citizen
    const report = await reportRepository.findById(assignment.report_id);
    if (report) {
      await notificationRepository.create({
        user_id: report.citizen_id,
        title: 'Waste Collected Successfully',
        message: `Your reported debris at ${report.address} has been collected and cleared by ${assignment.collection_team_name}. Verified weight: ${validated.verified_weight_kg} kg.`,
        report_id: report.id,
        type: 'SUCCESS',
        read: false
      });
    }

    // Notify processing team of incoming intake
    await notificationRepository.create({
      user_id: 'e0000000-0000-0000-0000-000000000001',
      title: 'Incoming C&D Material Hauled to Yard',
      message: `${assignment.collection_team_name} has delivered ${validated.verified_weight_kg} kg from ${report?.address || assignment.report_id}. Ready for batch sorting.`,
      report_id: assignment.report_id,
      type: 'ACTION_REQUIRED',
      read: false
    });

    const freshAssignment = await collectionRepository.findAssignmentById(id, token);

    return res.status(201).json({
      success: true,
      data: {
        proof,
        assignment: freshAssignment
      }
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'SUBMIT_PROOF_FAILED', message: err.message }
    });
  }
}

export async function getTeams(req: AuthenticatedRequest, res: Response) {
  try {
    const teams = await collectionRepository.findAllTeams();
    return res.json({
      success: true,
      data: teams
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_TEAMS_FAILED', message: err.message }
    });
  }
}

export async function getZones(req: AuthenticatedRequest, res: Response) {
  try {
    const zones = await collectionRepository.findAllZones();
    return res.json({
      success: true,
      data: zones
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ZONES_FAILED', message: err.message }
    });
  }
}
