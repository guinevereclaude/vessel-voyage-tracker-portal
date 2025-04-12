
import React, { useState } from 'react';
import { Filter, RefreshCw, Ship, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Vessel } from '@/lib/mockDb';
import VesselListItem from './VesselListItem';
import { Skeleton } from '@/components/ui/skeleton';

interface VesselListProps {
  vessels: Vessel[];
  isLoading?: boolean;
  onUpdateVessel?: (vesselId: string, status: string) => void;
  onMarkSuccessful?: (vessel: Vessel) => void;
}

const VesselList: React.FC<VesselListProps> = ({ 
  vessels, 
  isLoading = false, 
  onUpdateVessel,
  onMarkSuccessful 
}) => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      toast({
        title: "Data refreshed",
        description: "Vessel tracking data has been updated",
      });
      setIsRefreshing(false);
    }, 1500);
  };

  const filteredVessels = statusFilter && statusFilter !== 'all'
    ? vessels.filter(vessel => vessel.status === statusFilter)
    : vessels;

  return (
    <div className="bg-white rounded-lg border border-maritime-200 overflow-hidden">
      <div className="p-4 border-b border-maritime-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-maritime-800">Tracked Vessels</h2>
        <div className="flex space-x-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value || undefined)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="docked">Docked</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-maritime-100">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 w-full">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))
        ) : filteredVessels.length > 0 ? (
          filteredVessels.map((vessel) => (
            <VesselListItem 
              key={vessel.id} 
              vessel={vessel}
              onUpdateStatus={onUpdateVessel ? (status) => onUpdateVessel(vessel.id, status) : undefined}
              onMarkSuccessful={onMarkSuccessful ? () => onMarkSuccessful(vessel) : undefined}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <Ship className="h-12 w-12 text-maritime-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-maritime-700">No vessels found</h3>
            <p className="text-maritime-500 mt-1">
              {statusFilter 
                ? `No vessels with '${statusFilter}' status` 
                : 'Add your first vessel to start tracking'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselList;
