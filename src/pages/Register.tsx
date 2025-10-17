import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload } from 'lucide-react';
import { z } from 'zod';

const studentProfileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  course: z.string().min(1, 'Course is required'),
  department: z.string().min(1, 'Department is required'),
  gpa: z.preprocess((val) => Number(val), z.number().min(0).max(10)),
  category: z.string(),
  nationality: z.string().min(1, 'Nationality is required'),
});

const orgProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  is_org: z.literal(true),
  is_org_approved: z.literal(false),
  org_name: z.string().min(1, 'Organisation name is required'),
  org_website: z.string().url().optional(),
});

type RegisterProps = {
  orgMode?: boolean;
};

const Register = ({ orgMode }: RegisterProps) => {
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [incomeCert, setIncomeCert] = useState<File | null>(null);
  const [isIndian, setIsIndian] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isOrgRegistration = orgMode || new URLSearchParams(location.search).get('org') === 'true';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (isOrgRegistration) {
        const orgData = {
          full_name: String(formData.get('full_name') || ''),
          is_org: true as const,
          is_org_approved: false as const,
          org_name: String(formData.get('org_name') || ''),
          org_website: formData.get('org_website') ? String(formData.get('org_website')) : undefined,
        };

        orgProfileSchema.parse(orgData);

        // upload org logo if present
        let orgLogoUrl: string | null = null;
        if (photo) {
          const { data: uploadData, error: uploadError } = await supabase.storage.from('org-logos').upload(`${user.id}/${photo.name}`, photo, { upsert: true });
          if (uploadError) throw uploadError;
          const { data: publicData } = supabase.storage.from('org-logos').getPublicUrl(uploadData.path);
          orgLogoUrl = publicData.publicUrl;
        }

        const insertPayload = {
          id: user.id,
          email: user.email!,
          ...orgData,
          // provide student-required fields with safe defaults so the generated Insert type is satisfied
          course: '',
          department: '',
          gpa: 0,
          category: 'General',
          nationality: 'Other',
          org_logo_url: orgLogoUrl,
        };

  const insertRes = await supabase.from('profiles').insert([insertPayload]);
  const { error } = insertRes as { data: any[] | null; error: any };
  if (error) throw error;
      } else {
        const studentData = {
          full_name: String(formData.get('full_name') || ''),
          course: String(formData.get('course') || ''),
          department: String(formData.get('department') || ''),
          gpa: Number(formData.get('gpa')),
          category: String(formData.get('category') || ''),
          nationality: String(formData.get('nationality') || ''),
          financial_background: String(formData.get('financial_background') || ''),
          interests: String(formData.get('interests') || ''),
          aadhaar_number: formData.get('aadhaar_number') ? String(formData.get('aadhaar_number')) : null,
          abc_id_number: formData.get('abc_id_number') ? String(formData.get('abc_id_number')) : null,
          is_org: false,
        };

        studentProfileSchema.parse(studentData);

        let photoUrl = null;
        if (photo) {
          photoUrl = await uploadFile(photo, 'profile-photos', `${user.id}/${photo.name}`);
        }

        let incomeUrl = null;
        if (incomeCert) {
          incomeUrl = await uploadFile(incomeCert, 'documents', `${user.id}/income_${incomeCert.name}`);
        }

        }

      toast({
        title: 'Profile created!',
        description: 'Your profile has been saved successfully',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Fill in your details to get scholarship recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Input id="course" name="course" placeholder="e.g., B.Tech" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>

              {/* Organisation-specific inputs */}
              {isOrgRegistration ? (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="org_name">Organisation Name *</Label>
                    <Input id="org_name" name="org_name" placeholder="Your organisation or institution" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="org_website">Organisation Website</Label>
                    <Input id="org_website" name="org_website" placeholder="https://example.org" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="photo">Organisation Logo (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="photo" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course *</Label>
                    <Input id="course" name="course" placeholder="e.g., B.Tech" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" name="department" placeholder="e.g., Computer Science" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA/CGPA (out of 10) *</Label>
                    <Input id="gpa" name="gpa" type="number" step="0.01" min="0" max="10" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                        <SelectItem value="OBC">OBC</SelectItem>
                        <SelectItem value="Minority">Minority</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Select name="nationality" onValueChange={(val) => setIsIndian(val === 'Indian')} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
                <Input id="department" name="department" placeholder="e.g., Computer Science" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA/CGPA (out of 10) *</Label>
                <Input id="gpa" name="gpa" type="number" step="0.01" min="0" max="10" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="Minority">Minority</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select name="nationality" onValueChange={(val) => setIsIndian(val === 'Indian')} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isIndian && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
                  <Input id="aadhaar_number" name="aadhaar_number" maxLength={12} placeholder="12-digit number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abc_id_number">ABC ID Number</Label>
                  <Input id="abc_id_number" name="abc_id_number" placeholder="Your ABC ID" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="financial_background">Financial Background</Label>
              <Textarea id="financial_background" name="financial_background" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests/Field of Study</Label>
              <Textarea id="interests" name="interests" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photograph * (.jpg, .jpeg, .png)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  required
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {isIndian && (
              <div className="space-y-2">
                <Label htmlFor="income_cert">Income Certificate (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="income_cert"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setIncomeCert(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input id="is_org" name="is_org" type="checkbox" className="mt-1" />
              <Label htmlFor="is_org">Register as Organisation / Scholarship Provider</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
