import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Scholarship {
  id: string;
  name: string;
  description: string;
  provider: string;
  eligibility: string;
  degree_level: string;
  category: string[];
  min_gpa: number | null;
  amount: string;
  deadline: string;
  link: string;
  state: string | null;
  created_by: string;
}

export const ScholarshipManager = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['General', 'SC', 'ST', 'OBC', 'Minority', 'Female'];
  const degreeLevels = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'All'];

  useEffect(() => {
    fetchScholarships();
  }, [user]);

  const fetchScholarships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScholarships(data || []);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      provider: formData.get('provider') as string,
      eligibility: formData.get('eligibility') as string,
      degree_level: formData.get('degree_level') as string,
      category: selectedCategories,
      min_gpa: parseFloat(formData.get('min_gpa') as string) || null,
      amount: formData.get('amount') as string,
      deadline: formData.get('deadline') as string,
      link: formData.get('link') as string,
      state: formData.get('state') as string || null,
      created_by: user.id,
    };

    try {
      if (editingScholarship) {
        const { error } = await supabase
          .from('scholarships')
          .update(data)
          .eq('id', editingScholarship.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Scholarship updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Scholarship created successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingScholarship(null);
      setSelectedCategories([]);
      fetchScholarships();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Scholarship deleted successfully',
      });

      fetchScholarships();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setSelectedCategories(scholarship.category);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingScholarship(null);
    setSelectedCategories([]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manage Scholarships</CardTitle>
            <CardDescription>Create, edit, and delete scholarships</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the scholarship details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Scholarship Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingScholarship?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingScholarship?.description}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider *</Label>
                    <Input
                      id="provider"
                      name="provider"
                      defaultValue={editingScholarship?.provider}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      placeholder="e.g., $5000 or Full Tuition"
                      defaultValue={editingScholarship?.amount}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree_level">Degree Level *</Label>
                    <Select name="degree_level" defaultValue={editingScholarship?.degree_level} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_gpa">Minimum GPA</Label>
                    <Input
                      id="min_gpa"
                      name="min_gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      defaultValue={editingScholarship?.min_gpa || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      defaultValue={editingScholarship?.deadline}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State (Optional)</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="e.g., California"
                      defaultValue={editingScholarship?.state || ''}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="eligibility">Eligibility *</Label>
                    <Textarea
                      id="eligibility"
                      name="eligibility"
                      defaultValue={editingScholarship?.eligibility}
                      rows={2}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="link">Application Link *</Label>
                    <Input
                      id="link"
                      name="link"
                      type="url"
                      placeholder="https://..."
                      defaultValue={editingScholarship?.link}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Categories *</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingScholarship ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {scholarships.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No scholarships yet. Create your first one!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scholarships.map((scholarship) => (
                <TableRow key={scholarship.id}>
                  <TableCell className="font-medium">{scholarship.name}</TableCell>
                  <TableCell>{scholarship.amount}</TableCell>
                  <TableCell>{new Date(scholarship.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {scholarship.category.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {scholarship.category.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{scholarship.category.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(scholarship)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(scholarship.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
