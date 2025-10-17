import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { CheckCircle, XCircle, Mail, Phone } from 'lucide-react';

type Application = Database['public']['Tables']['applications']['Row'];
type Scholarship = Database['public']['Tables']['scholarships']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ApplicationWithDetails extends Application {
  scholarship: Scholarship;
  student: Profile;
}

const ApplicationsManager = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data: scholarships, error: scholarshipsError } = await supabase
      .from('scholarships')
      .select('id')
      .eq('created_by', (await supabase.auth.getUser()).data.user?.id);

    if (scholarshipsError) {
      console.error('Error fetching scholarships:', scholarshipsError);
      setLoading(false);
      return;
    }

    const scholarshipIds = scholarships.map(s => s.id);

    if (scholarshipIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .in('scholarship_id', scholarshipIds)
      .order('applied_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      setLoading(false);
      return;
    }

    // Fetch related scholarship and student data
    const applicationsWithDetails = await Promise.all(
      applicationsData.map(async (app) => {
        const [scholarshipRes, profileRes] = await Promise.all([
          supabase.from('scholarships').select('*').eq('id', app.scholarship_id).single(),
          supabase.from('profiles').select('*').eq('id', app.user_id).single(),
        ]);

        return {
          ...app,
          scholarship: scholarshipRes.data!,
          student: profileRes.data!,
        };
      })
    );

    setApplications(applicationsWithDetails);
    setLoading(false);
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Application ${status.toLowerCase()}`,
    });

    fetchApplications();
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No applications received yet for your scholarships.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scholarship Applications</h2>
        <Badge variant="secondary">{applications.length} Total Applications</Badge>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{application.student.full_name}</CardTitle>
                  <CardDescription>
                    Applied for: <strong>{application.scholarship.name}</strong>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    application.status === 'Accepted'
                      ? 'default'
                      : application.status === 'Rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{application.student.email}</span>
                </div>
                <div>
                  <strong>Course:</strong> {application.student.course}
                </div>
                <div>
                  <strong>Department:</strong> {application.student.department}
                </div>
                <div>
                  <strong>GPA:</strong> {application.student.gpa}/10
                </div>
                <div>
                  <strong>Category:</strong> {application.student.category}
                </div>
                <div>
                  <strong>Applied on:</strong>{' '}
                  {new Date(application.applied_at).toLocaleDateString()}
                </div>
              </div>

              {application.status === 'Applied' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() => updateApplicationStatus(application.id, 'Accepted')}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateApplicationStatus(application.id, 'Rejected')}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsManager;
