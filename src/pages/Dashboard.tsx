
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Ship, Clock, MapPin, Flag, ChevronDown, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { vessels as initialVessels, Vessel } from '@/lib/mockDb';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vessels, setVessels] = useState<Vessel[]>(initialVessels);
  const [vesselName, setVesselName] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [destination, setDestination] = useState('');
  const [etaDate, setEtaDate] = useState<Date | undefined>(undefined);
  const [etaTime, setEtaTime] = useState('12:00');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

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
    const newVessel: Vessel = {
      id: `${vessels.length + 1}`,
      name: vesselName,
      vesselId: vesselId,
      destination: destination,
      eta: etaDateTime.toISOString(),
      status: 'in-transit',
      addedBy: user.username,
      addedAt: new Date().toISOString(),
    };
    
    setVessels([newVessel, ...vessels]);
    
    // Reset form
    setVesselName('');
    setVesselId('');
    setDestination('');
    setEtaDate(undefined);
    setEtaTime('12:00');
    
    toast({
      title: "Vessel added",
      description: `${vesselName} has been added to the tracking system`,
    });
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'bg-amber-500';
      case 'docked':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const filteredVessels = statusFilter
    ? vessels.filter(vessel => vessel.status === statusFilter)
    : vessels;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Add vessel form */}
        <div className="lg:col-span-1">
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
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
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Input
                        type="time"
                        value={etaTime}
                        onChange={(e) => setEtaTime(e.target.value)}
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
        </div>
        
        {/* Right column - Vessel list */}
        <div className="lg:col-span-2">
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
                    <SelectItem value="">All statuses</SelectItem>
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
                  <div 
                    key={vessel.id} 
                    className="p-4 hover:bg-maritime-50 transition-colors"
                  >
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
                        {getStatusBadge(vessel.status)}
                        <span className="text-xs text-maritime-500 mt-2">
                          Added {format(new Date(vessel.addedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
