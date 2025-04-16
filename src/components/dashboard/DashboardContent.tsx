
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Vessel } from '@/lib/mockDb';
import AddVesselForm from '@/components/vessel/AddVesselForm';
import VesselList from '@/components/vessel/VesselList';

interface DashboardContentProps {
  vessels: Vessel[];
  isLoading: boolean;
  onAddVessel: (vesselData: Omit<Vessel, 'id'>) => void;
  onUpdateVesselStatus: (vesselId: string, status: string) => void;
  onMarkSuccessful: (vessel: Vessel) => void;
  currentUser: {
    email?: string | null;
    username?: string | null;
  };
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  vessels,
  isLoading,
  onAddVessel,
  onUpdateVesselStatus,
  onMarkSuccessful,
  currentUser
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className={`w-full ${isMobile ? 'order-2' : 'lg:w-1/3'}`}>
        <AddVesselForm 
          onAddVessel={onAddVessel}
          currentUser={currentUser}
        />
      </div>
      
      <div className={`w-full ${isMobile ? 'order-1' : 'lg:w-2/3'}`}>
        <VesselList 
          vessels={vessels}
          isLoading={isLoading}
          onUpdateVessel={onUpdateVesselStatus}
          onMarkSuccessful={onMarkSuccessful}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
