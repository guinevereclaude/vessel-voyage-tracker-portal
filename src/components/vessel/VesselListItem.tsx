
import React from 'react';
import { format } from 'date-fns';
import { Ship, MapPin, Clock, MoreVertical, Check, AlertTriangle, Ship as ShipIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Vessel } from '@/lib/mockDb';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface VesselListItemProps {
  vessel: Vessel;
  onUpdateStatus?: (status: string) => void;
  onMarkSuccessful?: () => void;
}

const VesselListItem: React.FC<VesselListItemProps> = ({ 
  vessel, 
  onUpdateStatus,
  onMarkSuccessful 
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-transit':
        return <Badge className="bg-amber-500 hover:bg-amber-600">In Transit</Badge>;
      case 'docked':
        return <Badge className="bg-green-500 hover:bg-green-600">Docked</Badge>;
      case 'delayed':
        return <Badge className="bg-red-500 hover:bg-red-600">Delayed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="p-4 hover:bg-maritime-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <Ship className="h-5 w-5 text-maritime-600" />
          </div>
          <div>
            <h3 className="font-medium text-maritime-900">{vessel.name}</h3>
            <p className="text-sm text-maritime-700">ID: {vessel.vesselId}</p>
            <div className="flex items-center mt-2 text-sm text-maritime-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{vessel.destination}</span>
            </div>
            <div className="flex items-center mt-1 text-sm text-maritime-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>ETA: {formatDateTime(vessel.eta)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2">
            {getStatusBadge(vessel.status)}
            
            {(onUpdateStatus || onMarkSuccessful) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {onUpdateStatus && (
                    <>
                      <DropdownMenuItem onClick={() => onUpdateStatus('in-transit')}>
                        <ShipIcon className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Mark as In Transit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus('delayed')}>
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        <span>Mark as Delayed</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus('docked')}>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Mark as Docked</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {onMarkSuccessful && (
                    <>
                      {onUpdateStatus && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={onMarkSuccessful}>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Mark Trip as Successful</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <span className="text-xs text-maritime-500 mt-2">
            Added {format(new Date(vessel.addedAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VesselListItem;
