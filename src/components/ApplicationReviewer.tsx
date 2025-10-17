import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  applied_at: string;
  user_id: string;
  scholarship_id: string;
  scholarship: {
    name: string;
  };
  profile: {
    full_name: string;
    email: string;
    course: string;
    department: string;
    gpa: number;
    category: string;
    photo_url: string | null;
  };
}

export const ApplicationReviewer = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarship:scholarships(name),
          profile:profiles(full_name, email, course, department, gpa, category, photo_url)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const viewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
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

  const filteredApplications = applications.filter(app =>
    filterStatus === 'all' || app.status === filterStatus
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Application Reviews</CardTitle>
              <CardDescription>Review and manage scholarship applications</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No applications found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.profile?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>{application.scholarship?.name || 'N/A'}</TableCell>
                    <TableCell>{application.profile?.gpa.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.profile?.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.applied_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetails(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete profile information for the applicant
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedApplication.profile?.photo_url && (
                  <img
                    src={selectedApplication.profile.photo_url}
                    alt={selectedApplication.profile.full_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedApplication.profile?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.profile?.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Scholarship</Label>
                  <p className="text-sm">{selectedApplication.scholarship?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Course</Label>
                  <p className="text-sm">{selectedApplication.profile?.course || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{selectedApplication.profile?.department || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">GPA</Label>
                  <p className="text-sm">{selectedApplication.profile?.gpa.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedApplication.profile?.category || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Applied Date</Label>
                  <p className="text-sm">
                    {new Date(selectedApplication.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedApplication.id, 'Under Review')}
                  disabled={selectedApplication.status === 'Under Review'}
                >
                  Mark Under Review
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleStatusChange(selectedApplication.id, 'Accepted')}
                  disabled={selectedApplication.status === 'Accepted'}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange(selectedApplication.id, 'Rejected')}
                  disabled={selectedApplication.status === 'Rejected'}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-medium ${className}`}>{children}</div>;
}
