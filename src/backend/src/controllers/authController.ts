import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { userRepository } from '../repositories/index.js';
import { supabase } from '../lib/supabase.js';

export async function getMe(req: AuthenticatedRequest, res: Response) {
  return res.json({
    success: true,
    data: req.user || null
  });
}

/**
 * Admin-only endpoint to provision/invite COLLECTION_TEAM or PROCESSING_TEAM staff.
 * Prohibits creating another ADMIN.
 */
export async function inviteStaffUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, name, role, phone, organization, team_id, password } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email, name, and role are required.' }
      });
    }

    if (!['COLLECTION_TEAM', 'PROCESSING_TEAM'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Only COLLECTION_TEAM or PROCESSING_TEAM roles can be created via staff management.'
        }
      });
    }

    const defaultPassword = password || 'ReBuild@Mysuru2026!';

    // Attempt to create user via Supabase Auth admin API or standard sign-up
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      app_metadata: {
        provider: 'email',
        providers: ['email'],
        invited_by_admin: true
      },
      user_metadata: {
        name,
        role,
        phone: phone || null,
        organization: organization || null,
        team_id: team_id || null
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_CREATION_FAILED', message: authError.message }
      });
    }

    const createdProfile = await userRepository.findById(authData.user.id);

    return res.status(201).json({
      success: true,
      data: createdProfile || {
        id: authData.user.id,
        email,
        name,
        role,
        team_id,
        phone,
        organization
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'STAFF_INVITE_FAILED', message: err.message }
    });
  }
}

/**
 * Admin-only endpoint to list all staff members
 */
export async function getStaffUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const allUsers = await userRepository.findAll();
    const staff = allUsers.filter((u) => ['COLLECTION_TEAM', 'PROCESSING_TEAM', 'ADMIN'].includes(u.role));

    return res.json({
      success: true,
      data: staff
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_STAFF_FAILED', message: err.message }
    });
  }
}
