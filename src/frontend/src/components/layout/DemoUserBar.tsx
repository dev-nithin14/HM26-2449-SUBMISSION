import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoUserBar: React.FC = () => {
  const { activeRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabels = {
    CITIZEN: 'Citizen',
    BUILDER: 'Builder',
    COLLECTION_TEAM: 'Collection Crew',
    PROCESSING_TEAM: 'Processing Plant',
    ADMIN: 'MCC Admin'
  } as const;

  return (
    <div className="bg-charcoal-900 text-white text-xs py-1.5 px-4 border-b border-charcoal-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserRound className="h-4 w-4 shrink-0 text-forest-300" />
          <span className="truncate text-xs font-semibold text-white">
            {currentUser?.name || 'Authenticated user'}
          </span>
          <span className="text-[11px] text-sand-400">{roleLabels[activeRole]}</span>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="ml-1 inline-flex shrink-0 items-center gap-1 rounded border border-charcoal-700/60 bg-charcoal-800 px-2.5 py-1 text-xs font-medium text-sand-200 transition hover:bg-charcoal-700 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
