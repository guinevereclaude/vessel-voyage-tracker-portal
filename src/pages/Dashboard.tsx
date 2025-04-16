
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useVesselData } from '@/hooks/use-vessel-data';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const { vessels, isLoading, addVessel, updateVesselStatus, markSuccessful } = useVesselData();
  
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error('Error checking admin status:', error);
          return;
        }
        
        setIsAdmin(data || false);
      } catch (err) {
        console.error('Exception checking admin status:', err);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const handleAddVessel = (newVesselData: any) => {
    addVessel(newVesselData);
    
    toast({
      title: "Vessel added",
      description: `${newVesselData.name} has been added to the tracking system`,
    });
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        username={profile?.username || 'User'} 
        isAdmin={isAdmin} 
      />
      <DashboardContent
        vessels={vessels}
        isLoading={isLoading}
        onAddVessel={handleAddVessel}
        onUpdateVesselStatus={updateVesselStatus}
        onMarkSuccessful={markSuccessful}
        currentUser={{
          email: user.email,
          username: profile?.username
        }}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
