
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Vessel } from '@/lib/mockDb';

export const useVesselData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const { data: successfulTripIds } = await supabase
        .from('successful_trips')
        .select('trip_id');
      
      const excludeIds = successfulTripIds ? successfulTripIds.map(item => item.trip_id) : [];
      
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
      
      const activeTrips = excludeIds.length > 0 
        ? data.filter(trip => !excludeIds.includes(trip.id))
        : data;
      
      return activeTrips
        .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
        .map(trip => ({
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

  const addVesselMutation = useMutation({
    mutationFn: async (newVesselData: Omit<Vessel, 'id'>) => {
      const vesselData = {
        vessel_id: newVesselData.vesselId,
        vessel_name: newVesselData.name,
        destination: newVesselData.destination,
        eta: newVesselData.eta,
        status: newVesselData.status,
        added_by: newVesselData.addedBy,
        user_id: supabase.auth.getUser().then(response => response.data.user?.id)
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

  const markSuccessfulMutation = useMutation({
    mutationFn: async (vessel: Vessel) => {
      if (vessel.status !== 'docked') {
        await updateVesselStatusMutation.mutateAsync({ 
          vesselId: vessel.id, 
          status: 'docked' 
        });
      }
      
      const successfulTripData = {
        trip_id: vessel.id,
        vessel_id: vessel.vesselId,
        vessel_name: vessel.name,
        destination: vessel.destination,
        arrival_time: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
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
      queryClient.invalidateQueries({ queryKey: ['successful-trips'] });
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

  return {
    vessels,
    isLoading,
    addVessel: addVesselMutation.mutate,
    updateVesselStatus: updateVesselStatusMutation.mutate,
    markSuccessful: markSuccessfulMutation.mutate
  };
};
