
import React, { useState } from 'react';
import { Filter, RefreshCw, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Vessel } from '@/lib/mockDb';
import VesselListItem from './VesselListItem';

interface VesselListProps {
  vessels: Vessel[];
}

const VesselList: React.FC<VesselListProps> = ({ vessels }) => {
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

  const filteredVessels = statusFilter
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
        {filteredVessels.length > 0 ? (
          filteredVessels.map((vessel) => (
            <VesselListItem key={vessel.id} vessel={vessel} />
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
