
export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  name: string;
  role: 'admin' | 'operator';
}

export interface Vessel {
  id: string;
  name: string;
  vesselId: string;
  destination: string;
  eta: string;
  status: string; // Changed from strict union type to string to match Supabase data
  addedBy: string;
  addedAt: string;
}

// Mock database for users
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'password123', // In a real app, this would be hashed
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    username: 'operator',
    password: 'password123', // In a real app, this would be hashed
    name: 'John Operator',
    role: 'operator',
  },
];

// Mock database for vessels
export const vessels: Vessel[] = [
  {
    id: '1',
    name: 'Atlantic Voyager',
    vesselId: 'AV-2023-01',
    destination: 'Port of Rotterdam',
    eta: '2025-04-15T14:30:00',
    status: 'in-transit',
    addedBy: 'admin',
    addedAt: '2025-04-10T09:15:00',
  },
  {
    id: '2',
    name: 'Pacific Explorer',
    vesselId: 'PE-2023-02',
    destination: 'Port of Singapore',
    eta: '2025-04-18T10:00:00',
    status: 'delayed',
    addedBy: 'operator',
    addedAt: '2025-04-09T16:45:00',
  },
  {
    id: '3',
    name: 'Nordic Star',
    vesselId: 'NS-2023-05',
    destination: 'Port of New York',
    eta: '2025-04-12T08:15:00',
    status: 'docked',
    addedBy: 'admin',
    addedAt: '2025-04-08T11:30:00',
  },
];
