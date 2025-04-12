
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Vessel } from '@/lib/mockDb';

interface AddVesselFormProps {
  onAddVessel: (vessel: Omit<Vessel, 'id'>) => void;
  currentUser: {
    email?: string | null;
    username?: string | null;
  };
}

const AddVesselForm: React.FC<AddVesselFormProps> = ({ onAddVessel, currentUser }) => {
  const [vesselName, setVesselName] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [destination, setDestination] = useState('');
  const [etaDate, setEtaDate] = useState<Date | undefined>(undefined);
  const [etaTime, setEtaTime] = useState('12:00');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vesselName || !vesselId || !destination || !etaDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Format the ETA datetime
    const etaDateTime = new Date(etaDate);
    const [hours, minutes] = etaTime.split(':').map(Number);
    etaDateTime.setHours(hours, minutes);
    
    // Create new vessel
    const newVessel = {
      name: vesselName,
      vesselId: vesselId,
      destination: destination,
      eta: etaDateTime.toISOString(),
      status: 'in-transit', // This will be a string in the database
      addedBy: currentUser.username || currentUser.email?.split('@')[0] || 'unknown',
      addedAt: new Date().toISOString(),
    };
    
    onAddVessel(newVessel);
    
    // Reset form
    setVesselName('');
    setVesselId('');
    setDestination('');
    setEtaDate(undefined);
    setEtaTime('12:00');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-maritime-800">Add New Vessel</CardTitle>
        <CardDescription>
          Enter vessel details to start tracking
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vesselName">Vessel Name</Label>
            <Input
              id="vesselName"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
              placeholder="Enter vessel name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vesselId">Vessel ID</Label>
            <Input
              id="vesselId"
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
              placeholder="Enter vessel ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Port</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination port"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Estimated Time of Arrival (ETA)</Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="w-full sm:w-2/3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !etaDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {etaDate ? format(etaDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={etaDate}
                      onSelect={setEtaDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full sm:w-1/3">
                <Input
                  type="time"
                  value={etaTime}
                  onChange={(e) => setEtaTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-maritime-600 hover:bg-maritime-700"
          >
            Add Vessel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddVesselForm;
