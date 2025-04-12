
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Ship, LogOut, User, PlusCircle, LifeBuoy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-maritime-50">
      {/* Header */}
      <header className="bg-white border-b border-maritime-200 shadow-sm">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Ship className="h-8 w-8 text-maritime-600" />
            <div>
              <h1 className="text-xl font-bold text-maritime-900">Vessel Voyage Tracker</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-maritime-700" />
                  <span className="font-medium text-maritime-800">{profile?.name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <Ship className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 bg-white border-t border-maritime-200">
        <div className="container mx-auto text-center text-sm text-maritime-600">
          <p>© 2025 Vessel Voyage Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
