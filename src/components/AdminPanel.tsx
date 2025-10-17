import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Scholarship = Database['public']['Tables']['scholarships']['Row'];

const AdminPanel = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    const { data, error } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scholarships:', error);
      return;
    }

    setScholarships(data || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categories = formData.get('category')?.toString().split(',').map(c => c.trim()) || [];
    const user = await supabase.auth.getUser();

    const scholarshipData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      provider: formData.get('provider') as string,
      eligibility: formData.get('eligibility') as string,
      degree_level: formData.get('degree_level') as string,
      category: categories,
      min_gpa: formData.get('min_gpa') ? parseFloat(formData.get('min_gpa') as string) : null,
      amount: formData.get('amount') as string,
      deadline: formData.get('deadline') as string,
      link: formData.get('link') as string,
      state: formData.get('state') as string,
      created_by: user.data.user?.id,
    };

    if (editingId) {
      const { error } = await supabase.from('scholarships').update(scholarshipData).eq('id', editingId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update scholarship',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Updated',
        description: 'Scholarship updated successfully',
      });
    } else {
      const { error } = await supabase.from('scholarships').insert(scholarshipData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add scholarship',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Added',
        description: 'Scholarship added successfully',
      });
    }

    setShowForm(false);
    setEditingId(null);
    fetchScholarships();
    (e.target as HTMLFormElement).reset();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete scholarship',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Scholarship deleted successfully',
    });
    fetchScholarships();
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { error } = await supabase.from('scholarships').insert(json);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Added ${json.length} scholarships`,
        });
        fetchScholarships();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Invalid JSON file',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Panel - Manage Scholarships</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleBulkUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload JSON
            </Button>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Scholarship' : 'Add New Scholarship'}</CardTitle>
            <CardDescription>Fill in the details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Input id="provider" name="provider" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" required rows={3} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="eligibility">Eligibility *</Label>
                  <Textarea id="eligibility" name="eligibility" required rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree_level">Degree Level *</Label>
                  <Select name="degree_level" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Pre-Matric">Pre-Matric</SelectItem>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                      <SelectItem value="Post-Doctorate">Post-Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categories * (comma separated)</Label>
                  <Input id="category" name="category" placeholder="General, SC, ST" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA</Label>
                  <Input id="min_gpa" name="min_gpa" type="number" step="0.1" min="0" max="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" name="amount" placeholder="e.g., ₹50,000 per year" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input id="deadline" name="deadline" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="All India" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="link">Application Link *</Label>
                  <Input id="link" name="link" type="url" required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update' : 'Add'} Scholarship</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{scholarship.name}</CardTitle>
                  <CardDescription>{scholarship.provider}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(scholarship.id);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(scholarship.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount:</strong> {scholarship.amount}
              </p>
              <p>
                <strong>Categories:</strong> {scholarship.category.join(', ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
