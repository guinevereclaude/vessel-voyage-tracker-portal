
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Clock from '@/components/Clock';

interface DashboardHeaderProps {
  username: string;
  isAdmin: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-maritime-900">Vessel Tracking</h1>
        <div className="flex items-center gap-2 text-maritime-600">
          <span>Welcome, {username}</span>
          <Clock />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
          onClick={() => navigate('/successful-trips')}
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="whitespace-nowrap">View Successful Voyages</span>
        </Button>
        
        {isAdmin && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="whitespace-nowrap">Admin Panel</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
