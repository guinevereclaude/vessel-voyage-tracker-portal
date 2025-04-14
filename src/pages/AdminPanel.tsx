
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftIcon, UserX, ShieldCheck, User, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if current user is admin
  useQuery({
    queryKey: ['check-admin'],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      setIsAdmin(data || false);
      return data || false;
    }
  });
  
  // Fetch all users (if admin)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      // First get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        toast({
          title: "Error fetching users",
          description: authError.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Then get all admin users to mark who is admin
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id');
      
      if (adminError) {
        console.error('Error fetching admin users:', adminError);
      }
      
      const adminUserIds = adminUsers ? adminUsers.map(admin => admin.user_id) : [];
      
      // Then get profile info for each user
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      // Combine all data
      return authUsers.users.map(authUser => ({
        id: authUser.id,
        email: authUser.email,
        username: profileMap.get(authUser.id)?.username || 'Unknown',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        is_admin: adminUserIds.includes(authUser.id)
      }));
    },
    enabled: isAdmin,
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw error;
      }
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "The user has been removed from the system",
      });
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle admin status mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        // Add user as admin
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId });
          
        if (error) {
          throw error;
        }
      } else {
        // Remove user as admin
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);
          
        if (error) {
          throw error;
        }
      }
      
      return { userId, makeAdmin };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: data.makeAdmin ? "Admin added" : "Admin removed",
        description: data.makeAdmin 
          ? "The user has been given admin privileges" 
          : "Admin privileges have been revoked from the user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update admin status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
  };
  
  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };
  
  const handleToggleAdmin = (user: UserData) => {
    toggleAdminMutation.mutate({
      userId: user.id,
      makeAdmin: !user.is_admin
    });
  };
  
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg border border-maritime-200 p-6 text-center">
          <Shield className="h-12 w-12 text-maritime-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-maritime-800 mb-2">Access Denied</h2>
          <p className="text-maritime-600">You don't have permission to access the admin panel.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-maritime-900">Admin Panel</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border border-maritime-200 overflow-hidden">
        <div className="p-4 border-b border-maritime-200">
          <h2 className="text-lg font-semibold text-maritime-800">User Management</h2>
          <p className="text-sm text-maritime-600 mt-1">Manage users and their permissions</p>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">{userData.username}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      {userData.is_admin ? (
                        <div className="flex items-center text-green-600">
                          <ShieldCheck className="h-4 w-4 mr-1" /> Admin
                        </div>
                      ) : (
                        <div className="flex items-center text-maritime-600">
                          <User className="h-4 w-4 mr-1" /> Regular User
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(userData)}
                        >
                          {userData.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(userData)}
                          disabled={userData.id === user?.id} // Don't allow users to delete themselves
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-maritime-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-maritime-700">No users found</h3>
            <p className="text-maritime-500 mt-1">
              There are no users in the system
            </p>
          </div>
        )}
      </div>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete?.username}"? 
              This action cannot be undone and all data associated with this user will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminPanel;
