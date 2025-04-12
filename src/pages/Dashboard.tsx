
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { vessels as initialVessels, Vessel } from '@/lib/mockDb';
import AddVesselForm from '@/components/vessel/AddVesselForm';
import VesselList from '@/components/vessel/VesselList';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [vessels, setVessels] = useState<Vessel[]>(initialVessels);

  // Redirect if not logged in
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleAddVessel = (newVesselData: Omit<Vessel, 'id'>) => {
    // Create new vessel with ID
    const newVessel: Vessel = {
      id: `${vessels.length + 1}`,
      ...newVesselData
    };
    
    setVessels([newVessel, ...vessels]);
    
    toast({
      title: "Vessel added",
      description: `${newVessel.name} has been added to the tracking system`,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Add vessel form */}
        <div className={`w-full ${isMobile ? 'order-2' : 'md:w-1/3'}`}>
          <AddVesselForm 
            onAddVessel={handleAddVessel} 
            currentUser={{
              email: user.email,
              username: profile?.username
            }}
          />
        </div>
        
        {/* Vessel list */}
        <div className={`w-full ${isMobile ? 'order-1' : 'md:w-2/3'}`}>
          <VesselList vessels={vessels} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
