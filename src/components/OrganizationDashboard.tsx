import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPanel from './AdminPanel';
import ApplicationsManager from './ApplicationsManager';
import ProfileView from './ProfileView';
import { Database } from '@/integrations/supabase/types';
import { useState } from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface OrganizationDashboardProps {
  profile: Profile;
}

const OrganizationDashboard = ({ profile }: OrganizationDashboardProps) => {
  const [currentProfile, setCurrentProfile] = useState(profile);

  return (
    <Tabs defaultValue="scholarships" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-8">
        <TabsTrigger value="scholarships">My Scholarships</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="scholarships">
        <AdminPanel />
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationsManager />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileView profile={currentProfile} onUpdate={setCurrentProfile} />
      </TabsContent>
    </Tabs>
  );
};

export default OrganizationDashboard;
