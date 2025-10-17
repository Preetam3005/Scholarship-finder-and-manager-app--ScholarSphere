import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScholarshipManager } from './ScholarshipManager';
import { ApplicationReviewer } from './ApplicationReviewer';
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
        <ScholarshipManager />
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationReviewer />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileView profile={currentProfile} onUpdate={setCurrentProfile} />
      </TabsContent>
    </Tabs>
  );
};

export default OrganizationDashboard;
