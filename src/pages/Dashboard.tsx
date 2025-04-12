
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Vessel } from '@/lib/mockDb';
import AddVesselForm from '@/components/vessel/AddVesselForm';
import VesselList from '@/components/vessel/VesselList';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  // Redirect if not logged in
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  // Fetch vessels from Supabase
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('all_trips')
        .select('*')
        .order('added_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vessels:', error);
        toast({
          title: "Error fetching vessels",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(trip => ({
        id: trip.id,
        name: trip.vessel_name,
        vesselId: trip.vessel_id,
        destination: trip.destination,
        eta: trip.eta,
        status: trip.status,
        addedBy: trip.added_by,
        addedAt: trip.added_at
      }));
    }
  });

  // Add vessel mutation
  const addVesselMutation = useMutation({
    mutationFn: async (newVesselData: Omit<Vessel, 'id'>) => {
      if (!user) throw new Error('User must be logged in');
      
      const vesselData = {
        vessel_id: newVesselData.vesselId,
        vessel_name: newVesselData.name,
        destination: newVesselData.destination,
        eta: newVesselData.eta,
        status: newVesselData.status,
        added_by: newVesselData.addedBy,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('all_trips')
        .insert(vesselData)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        name: data.vessel_name,
        vesselId: data.vessel_id,
        destination: data.destination,
        eta: data.eta,
        status: data.status,
        addedBy: data.added_by,
        addedAt: data.added_at
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add vessel",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update vessel status mutation
  const updateVesselStatusMutation = useMutation({
    mutationFn: async ({ vesselId, status }: { vesselId: string, status: string }) => {
      const { data, error } = await supabase
        .from('all_trips')
        .update({ status })
        .eq('id', vesselId)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast({
        title: "Status updated",
        description: "Vessel status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mark vessel as successful trip mutation
  const markSuccessfulMutation = useMutation({
    mutationFn: async (vessel: Vessel) => {
      if (!user) throw new Error('User must be logged in');
      
      // First, update the status to 'docked' if it's not already
      if (vessel.status !== 'docked') {
        await updateVesselStatusMutation.mutateAsync({ 
          vesselId: vessel.id, 
          status: 'docked' 
        });
      }
      
      // Then add it to the successful_trips table
      const successfulTripData = {
        trip_id: vessel.id,
        vessel_id: vessel.vesselId,
        vessel_name: vessel.name,
        destination: vessel.destination,
        arrival_time: new Date().toISOString(),
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('successful_trips')
        .insert(successfulTripData)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast({
        title: "Trip completed",
        description: "Vessel has been marked as successfully completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mark as successful",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddVessel = (newVesselData: Omit<Vessel, 'id'>) => {
    addVesselMutation.mutate(newVesselData);
    
    toast({
      title: "Vessel added",
      description: `${newVesselData.name} has been added to the tracking system`,
    });
  };

  const handleUpdateVesselStatus = (vesselId: string, status: string) => {
    updateVesselStatusMutation.mutate({ vesselId, status });
  };

  const handleMarkSuccessful = (vessel: Vessel) => {
    markSuccessfulMutation.mutate(vessel);
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
          <VesselList 
            vessels={vessels} 
            isLoading={isLoading}
            onUpdateVessel={handleUpdateVesselStatus}
            onMarkSuccessful={handleMarkSuccessful}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
