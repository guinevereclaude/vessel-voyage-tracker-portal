
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Ship, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface SuccessfulTrip {
  id: string;
  vessel_name: string;
  vessel_id: string;
  destination: string;
  arrival_time: string;
  completed_at: string;
  completion_notes: string | null;
}

const SuccessfulTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not logged in
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  // Fetch successful trips from Supabase
  const { data: successfulTrips = [], isLoading } = useQuery({
    queryKey: ['successful-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('successful_trips')
        .select('*')
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching successful trips:', error);
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as SuccessfulTrip[];
    }
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-maritime-900">Successful Voyages</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-maritime-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : successfulTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel Name</TableHead>
                  <TableHead>Vessel ID</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Completed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {successfulTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.vessel_name}</TableCell>
                    <TableCell>{trip.vessel_id}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{formatDateTime(trip.arrival_time)}</TableCell>
                    <TableCell>{formatDateTime(trip.completed_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Ship className="h-12 w-12 text-maritime-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-maritime-700">No successful voyages yet</h3>
            <p className="text-maritime-500 mt-1">
              Completed voyages will appear here
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SuccessfulTrips;
