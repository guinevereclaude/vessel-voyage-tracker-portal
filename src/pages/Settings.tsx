
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Moon, Sun, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Form schemas
const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const contactSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().optional(),
});

const Settings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Contact form
  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: user?.email || "",
      name: profile?.name || "",
      phone: "",
    },
  });

  // Update password
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Update contact info
  const onContactSubmit = async (values: z.infer<typeof contactSchema>) => {
    try {
      // Update email if changed
      if (values.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) {
          toast({
            title: "Email update failed",
            description: emailError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Update profile info
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name: values.name,
          })
          .eq('id', user?.id);

        if (profileError) {
          toast({
            title: "Profile update failed",
            description: profileError.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Contact information updated",
        description: "Your contact information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Toggle dark mode
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    // Here you would implement the actual dark mode toggle functionality
    // For example, using a context or localStorage
    toast({
      title: checked ? "Dark mode enabled" : "Dark mode disabled",
      description: "Your preference has been saved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-maritime-900">Settings</h1>
          <p className="text-maritime-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-maritime-600" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-maritime-600" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-maritime-600" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-maritime-600" />
                            Phone Number (optional)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Contact Information</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-maritime-600" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Update Password</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {darkMode ? (
                    <Moon className="mr-2 h-5 w-5 text-maritime-600" />
                  ) : (
                    <Sun className="mr-2 h-5 w-5 text-maritime-600" />
                  )}
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-maritime-600" />
                    <span>Light</span>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={handleDarkModeToggle} 
                  />
                  <div className="flex items-center space-x-2">
                    <Moon className="h-5 w-5 text-maritime-600" />
                    <span>Dark</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground pt-2">
                  More appearance settings will be available in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
