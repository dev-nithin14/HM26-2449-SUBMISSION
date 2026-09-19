import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-charcoal-900 font-display">404</h1>
      <h2 className="text-lg font-bold text-charcoal-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-charcoal-500 max-w-sm mt-1 mb-6">
        The requested municipal page does not exist or has been relocated.
      </p>
      <Link to="/overview">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Overview
        </Button>
      </Link>
    </div>
  );
};
