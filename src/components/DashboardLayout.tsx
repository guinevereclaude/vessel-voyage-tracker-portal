
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Ship, LogOut, User, PlusCircle, LifeBuoy, Settings, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Navigation = () => (
    <>
      <Link to="/dashboard" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-maritime-100 transition-colors">
        <Ship className="h-5 w-5 text-maritime-700" />
        <span className="font-medium text-maritime-800">Dashboard</span>
      </Link>
      <Link to="/settings" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-maritime-100 transition-colors">
        <Settings className="h-5 w-5 text-maritime-700" />
        <span className="font-medium text-maritime-800">Settings</span>
      </Link>
      <div className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-maritime-100 transition-colors cursor-pointer" onClick={handleLogout}>
        <LogOut className="h-5 w-5 text-maritime-700" />
        <span className="font-medium text-maritime-800">Log out</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-maritime-50">
      {/* Header */}
      <header className="bg-white border-b border-maritime-200 shadow-sm">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Ship className="h-8 w-8 text-maritime-600" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-maritime-900">Vessel Voyage Tracker</h1>
            </div>
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="py-4">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="h-5 w-5 text-maritime-700" />
                    <span className="font-medium text-maritime-800">{profile?.name || user?.email}</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col space-y-2">
                    <Navigation />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-maritime-700" />
                    <span className="font-medium text-maritime-800 max-w-[150px] truncate">{profile?.name || user?.email}</span>
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
          )}
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
