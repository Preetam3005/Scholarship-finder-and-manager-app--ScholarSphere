import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStudentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
  loginSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
  navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      loginSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      toast({ title: 'Welcome back!', description: 'Organisation logged in' });
      navigate('/admin');
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  const handleStudentSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      loginSchema.parse({ email, password });

      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/register` } });

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: 'Please complete your profile',
      });
  navigate('/register');
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      loginSchema.parse({ email, password });

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/register?org=true`,
        },
      });

      if (error) throw error;

      toast({ title: 'Account created!', description: 'Please complete your organisation profile' });
      navigate('/register?org=true');
    } catch (error: any) {
      toast({ title: 'Signup failed', description: error.message || 'Could not create account', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Scholarship Finder</CardTitle>
          <CardDescription>Find and manage your scholarship applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student-login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student-login">Student Login</TabsTrigger>
              <TabsTrigger value="student-signup">Student Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="student-login">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email / ABC ID</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="student-signup">
              <form onSubmit={handleStudentSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            <div className="border-t mt-4 pt-4">
              <h3 className="text-center mb-4 font-semibold">Organisation</h3>
              <Tabs defaultValue="org-login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="org-login">Org Login</TabsTrigger>
                  <TabsTrigger value="org-signup">Org Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="org-login">
                  <form onSubmit={handleOrgLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-email">Organisation Email</Label>
                      <Input id="org-email" name="email" type="email" placeholder="org@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-password">Password</Label>
                      <Input id="org-password" name="password" type="password" placeholder="••••••••" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Org Login'}</Button>
                  </form>
                </TabsContent>
                <TabsContent value="org-signup">
                  <form onSubmit={handleOrgSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-signup-email">Organisation Email</Label>
                      <Input id="org-signup-email" name="email" type="email" placeholder="org@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-signup-password">Password</Label>
                      <Input id="org-signup-password" name="password" type="password" placeholder="••••••••" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Organisation Account'}</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
