import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  reportRepository,
  collectionRepository,
  notificationRepository
} from '../repositories/index.js';
import {
  CreateReportSchema,
  UpdateReportSchema,
  VerifyReportSchema,
  AssignReportSchema
} from '../validators/index.js';
import { aiAnalysisService } from '../services/ai/aiAnalysisService.js';
import { verificationService } from '../services/verification/verificationService.js';
import { priorityService } from '../services/priority/priorityService.js';
import { routingService } from '../services/routing/routingService.js';
import { uploadReportImage } from '../services/storage/storageService.js';
import { ReportImage } from '../types/index.js';

export async function getReports(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, waste_type, priority, zone_id, citizen_id, search } = req.query;

    const reports = await reportRepository.findAll({
      status: status as any,
      waste_type: waste_type as any,
      priority: priority as any,
      zone_id: zone_id as string,
      citizen_id: citizen_id as string,
      search: search as string
    });

    return res.json({
      success: true,
      data: reports
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_REPORTS_FAILED', message: err.message }
    });
  }
}

export async function createReport(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = CreateReportSchema.parse(req.body);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in to submit a report.' }
      });
    }
    const currentUser = req.user;

    const tempId = `RBL-MYS-TEMP-${Date.now()}`;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    // Format images — ensuring any base64 data is uploaded to Supabase Storage
    const reportImages: ReportImage[] = await Promise.all(
      validated.images.map(async (img, idx) => {
        let imageUrl = img.image_url;
        let sizeBytes = img.file_size_bytes;

        // If client passed a base64 data URL, upload to Supabase Storage report-images
        if (imageUrl.startsWith('data:')) {
          const uploadResult = await uploadReportImage(
            imageUrl,
            `waste_photo_${idx + 1}.jpg`,
            currentUser.id,
            token
          );
          imageUrl = uploadResult.publicUrl;
          sizeBytes = uploadResult.sizeBytes;
        }

        return {
          id: `img-${uuidv4().substring(0, 8)}`,
          report_id: tempId,
          image_url: imageUrl,
          thumbnail_url: img.thumbnail_url || imageUrl,
          file_size_bytes: sizeBytes,
          uploaded_at: new Date().toISOString()
        };
      })
    );

    // Trigger Prototype AI Analysis
    const aiResult = aiAnalysisService.analyzeReport({
      reportId: tempId,
      wasteType: validated.waste_type,
      description: validated.description,
      imageCount: reportImages.length
    });

    // Create preliminary object for priority calculation
    const dummyReport: any = {
      id: tempId,
      citizen_id: currentUser.id,
      citizen_name: currentUser.name,
      citizen_phone: validated.contact_phone || currentUser.phone,
      waste_type: validated.waste_type,
      estimated_quantity: validated.estimated_quantity,
      quantity_unit: validated.quantity_unit,
      description: validated.description,
      latitude: validated.latitude,
      longitude: validated.longitude,
      address: validated.address,
      landmark: validated.landmark,
      zone_id: validated.zone_id,
      preferred_pickup_date: validated.preferred_pickup_date,
      preferred_pickup_time_slot: validated.preferred_pickup_time_slot,
      contact_phone: validated.contact_phone || currentUser.phone,
      pickup_instructions: validated.pickup_instructions,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      priority_score: 50,
      priority_reasons: [],
      images: reportImages,
      ai_analysis: aiResult,
      created_at: new Date().toISOString()
    };

    const priorityResult = priorityService.calculatePriority(dummyReport);

    // Save to repository
    const created = await reportRepository.create({
      citizen_id: currentUser.id,
      citizen_name: currentUser.name,
      citizen_phone: validated.contact_phone || currentUser.phone,
      waste_type: validated.waste_type,
      estimated_quantity: validated.estimated_quantity,
      quantity_unit: validated.quantity_unit,
      description: validated.description,
      latitude: validated.latitude,
      longitude: validated.longitude,
      address: validated.address,
      landmark: validated.landmark,
      zone_id: validated.zone_id,
      preferred_pickup_date: validated.preferred_pickup_date,
      preferred_pickup_time_slot: validated.preferred_pickup_time_slot,
      contact_phone: validated.contact_phone || currentUser.phone,
      pickup_instructions: validated.pickup_instructions,
      status: 'SUBMITTED',
      priority: priorityResult.priority,
      priority_score: priorityResult.priority_score,
      priority_reasons: priorityResult.priority_reasons,
      images: reportImages.map((img) => ({ ...img, report_id: tempId })),
      ai_analysis: { ...aiResult, report_id: tempId }
    }, token);

    // Fix IDs on images and ai_analysis
    created.images = created.images.map((i) => ({ ...i, report_id: created.id }));
    if (created.ai_analysis) {
      created.ai_analysis.report_id = created.id;
    }

    // Add automated AI analysis timeline event
    await reportRepository.addTimelineEvent(created.id, {
      status: 'AI_ANALYZED',
      actor_id: 'sys-ai',
      actor_name: 'AI Analysis Service (v1.4)',
      actor_role: 'ADMIN',
      note: `Analyzed composition: ${aiResult.waste_composition.concrete_percentage}% Concrete, ${aiResult.waste_composition.bricks_percentage}% Bricks. Recyclability rated ${aiResult.recyclability}. Confidence ${Math.round(aiResult.confidence * 100)}%.`
    }, token);

    // Notify citizen
    await notificationRepository.create({
      user_id: currentUser.id,
      title: 'Report Submitted Successfully',
      message: `Your waste report ${created.id} has been registered and analyzed by ReBuild AI.`,
      report_id: created.id,
      type: 'INFO',
      read: false
    });

    // Notify admins
    await notificationRepository.create({
      user_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'New C&D Waste Report Received',
      message: `New report ${created.id} (${created.waste_type}, ${created.estimated_quantity} ${created.quantity_unit}) at ${created.address}.`,
      report_id: created.id,
      type: 'ACTION_REQUIRED',
      read: false
    });

    // Return the updated report with timeline
    const fresh = await reportRepository.findById(created.id);

    return res.status(201).json({
      success: true,
      data: fresh || created
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid report data', details: err.errors }
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'REPORT_CREATION_FAILED', message: err.message }
    });
  }
}

export async function getReportById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportRepository.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report with ID ${id} was not found` }
      });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_REPORT_FAILED', message: err.message }
    });
  }
}

export async function updateReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const validated = UpdateReportSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report with ID ${id} was not found` }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const updates: any = {};
    if (validated.status) updates.status = validated.status;
    if (validated.priority) updates.priority = validated.priority;

    const updated = await reportRepository.update(id, updates, token);

    if (validated.status && validated.status !== report.status) {
      await reportRepository.addTimelineEvent(id, {
        status: validated.status,
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        note: validated.notes || `Report status updated to ${validated.status}`
      }, token);
    }

    const fresh = await reportRepository.findById(id);

    return res.json({
      success: true,
      data: fresh || updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: err.message }
    });
  }
}

export async function analyzeReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    const analysis = aiAnalysisService.analyzeReport({
      reportId: report.id,
      wasteType: report.waste_type,
      description: report.description,
      imageCount: report.images.length
    });

    await reportRepository.update(id, { ai_analysis: analysis });
    await reportRepository.addTimelineEvent(id, {
      status: 'AI_ANALYZED',
      actor_id: 'sys-ai',
      actor_name: 'AI Analysis Service',
      actor_role: 'ADMIN',
      note: 'Re-analyzed waste characteristics with computer vision inference model.'
    });

    const fresh = await reportRepository.findById(id);
    return res.json({
      success: true,
      data: fresh?.ai_analysis
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: err.message }
    });
  }
}

export async function getReportAnalysis(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    return res.json({
      success: true,
      data: report.ai_analysis || null
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_ANALYSIS_FAILED', message: err.message }
    });
  }
}

export async function verifyReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const validated = VerifyReportSchema.parse(req.body);
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only an administrator can verify reports.' }
      });
    }
    const currentUser = req.user;

    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    const verification = await verificationService.verifyReport(
      report,
      currentUser.id,
      currentUser.name,
      validated.status,
      validated.notes
    );

    let nextReportStatus = report.status;
    if (verification.status === 'VERIFIED') {
      nextReportStatus = 'VERIFIED';
    } else if (verification.status === 'REJECTED') {
      nextReportStatus = 'REJECTED';
    } else if (verification.status === 'POSSIBLE_DUPLICATE') {
      nextReportStatus = 'DUPLICATE';
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    await reportRepository.update(id, {
      verification,
      status: nextReportStatus
    }, token);

    await reportRepository.addTimelineEvent(id, {
      status: nextReportStatus,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      note: validated.notes || `Report verification updated to ${verification.status}.`
    }, token);

    // Notify citizen
    await notificationRepository.create({
      user_id: report.citizen_id,
      title: `Report Verification Update: ${verification.status}`,
      message: `Your report ${id} has been reviewed by the Municipal Desk: ${verification.notes || verification.status}.`,
      report_id: id,
      type: verification.status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
      read: false
    });

    const fresh = await reportRepository.findById(id);

    return res.json({
      success: true,
      data: fresh
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'VERIFICATION_FAILED', message: err.message }
    });
  }
}

export async function calculatePriority(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    const result = priorityService.calculatePriority(report);

    await reportRepository.update(id, {
      priority: result.priority,
      priority_score: result.priority_score,
      priority_reasons: result.priority_reasons
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PRIORITY_CALCULATION_FAILED', message: err.message }
    });
  }
}

export async function getReportRouting(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    const recommendation = await routingService.getRoutingRecommendation(report);

    return res.json({
      success: true,
      data: recommendation
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ROUTING_FAILED', message: err.message }
    });
  }
}

export async function assignReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const validated = AssignReportSchema.parse(req.body);
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only an administrator can dispatch collection assignments.' }
      });
    }
    const currentUser = req.user;

    const report = await reportRepository.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report ${id} not found` }
      });
    }

    const team = await collectionRepository.findTeamById(validated.collection_team_id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'TEAM_NOT_FOUND', message: 'Selected collection team does not exist' }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    // Create assignment
    const assignment = await collectionRepository.createAssignment({
      report_id: id,
      collection_team_id: team.id,
      collection_team_name: team.team_name,
      status: 'PENDING',
      assigned_by: currentUser.id
    }, token);

    // Update report
    await reportRepository.update(id, {
      status: 'ASSIGNED',
      assigned_collection_team_id: team.id,
      assigned_collection_team_name: team.team_name
    }, token);

    await reportRepository.addTimelineEvent(id, {
      status: 'ASSIGNED',
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      note: `Assigned to ${team.team_name} (Lead: ${team.lead_driver_name}, Vehicle: ${team.vehicle_number}).`
    }, token);

    // Notifications
    await notificationRepository.create({
      user_id: team.id, // Or lead driver
      title: 'New Collection Assignment Dispatched',
      message: `Pickup order ${assignment.id} for ${report.waste_type} at ${report.address}.`,
      report_id: id,
      type: 'ACTION_REQUIRED',
      read: false
    });

    await notificationRepository.create({
      user_id: report.citizen_id,
      title: 'Collection Team Assigned',
      message: `Your report ${id} has been scheduled. ${team.team_name} has been assigned for pickup.`,
      report_id: id,
      type: 'INFO',
      read: false
    });

    const fresh = await reportRepository.findById(id);

    return res.json({
      success: true,
      data: {
        report: fresh,
        assignment
      }
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'ASSIGNMENT_FAILED', message: err.message }
    });
  }
}
