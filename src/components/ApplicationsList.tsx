import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { generateApplicationsPDF } from '@/lib/pdfExport';
import { FileDown, Trash2, ExternalLink } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];
type Scholarship = Database['public']['Tables']['scholarships']['Row'];

interface ApplicationWithScholarship extends Application {
  scholarships: Scholarship;
}

interface Props {
  profile: Profile;
}

const ApplicationsList = ({ profile }: Props) => {
  const [applications, setApplications] = useState<ApplicationWithScholarship[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*, scholarships(*)')
      .eq('user_id', profile.id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive',
      });
      return;
    }

    setApplications(applications.filter((app) => app.id !== id));
    toast({
      title: 'Deleted',
      description: 'Application removed',
    });
  };

  const handleExportPDF = async () => {
    try {
      await generateApplicationsPDF(applications, profile, profile.photo_url || undefined);
      toast({
        title: 'PDF Generated',
        description: 'Your applications report has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'default';
      case 'Under Review':
        return 'secondary';
      case 'Accepted':
        return 'default';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Applications ({applications.length})</h2>
        {applications.length > 0 && (
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          You haven't applied to any scholarships yet
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{app.scholarships.name}</CardTitle>
                    <CardDescription>{app.scholarships.provider}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Amount:</strong> {app.scholarships.amount}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {new Date(app.scholarships.deadline).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Applied on:</strong> {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={app.scholarships.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(app.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
