import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';
import ScholarshipList from '@/components/ScholarshipList';
import ApplicationsList from '@/components/ApplicationsList';
import ProfileView from '@/components/ProfileView';
import OrganizationDashboard from '@/components/OrganizationDashboard';
import { Database } from '@/integrations/supabase/types';
import { seedScholarships } from '@/scripts/seedScholarships';

type Profile = Database['public']['Tables']['profiles']['Row'] & { is_org?: boolean };

const Dashboard = () => {
  const { user, signOut, userRole, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        navigate('/register');
      } else {
        setProfile(data);
      }
    };

    const initializeData = async () => {
      await seedScholarships();
    };

    fetchProfile();
    initializeData();
  }, [user, navigate]);

  if (!profile || authLoading) {
    return null;
  }

  if (userRole === 'organization') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Scholarship Provider Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {profile.full_name}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <OrganizationDashboard profile={profile} />
        </main>
      </div>
    );
  }

  // Students get the normal dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Scholarship Finder</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile.full_name}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="scholarships" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-8">
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {profile.is_org && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="scholarships">
            <ScholarshipList profile={profile} />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsList profile={profile} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileView profile={profile} onUpdate={setProfile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
