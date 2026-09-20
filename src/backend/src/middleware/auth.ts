import { Request, Response, NextFunction } from 'express';
import { UserProfile, UserRole } from '../types/index.js';
import { userRepository } from '../repositories/index.js';
import { supabase } from '../lib/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

/**
 * Real Supabase JWT Bearer Authentication Middleware.
 * Replaces simulated demo headers with cryptographic token validation via Supabase Auth.
 * Unauthenticated requests proceed without req.user; protected routes enforce auth via requireAuth / requireRole.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'] || (req.headers['Authorization'] as string);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();

      if (token) {
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data?.user) {
          const profile = await userRepository.findById(data.user.id);
          if (profile) {
            req.user = profile;
          }
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Ensures request contains a valid authenticated Supabase session
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in with a valid Supabase account.'
      }
    });
  }
  next();
}

/**
 * Enforces role-based access control against the user's authentic database role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in with a valid Supabase account.'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Current role '${req.user.role}' is not authorized. Requires one of: ${allowedRoles.join(', ')}`
        }
      });
    }

    next();
  };
}
