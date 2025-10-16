import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { User, GraduationCap, Award, MapPin } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

const ProfileView = ({ profile }: Props) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Academic Details</span>
              </div>
              <div className="space-y-1">
                <p>
                  <strong>Course:</strong> {profile.course}
                </p>
                <p>
                  <strong>Department:</strong> {profile.department}
                </p>
                <p>
                  <strong>GPA:</strong> {profile.gpa}/10
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Category & Eligibility</span>
              </div>
              <div className="space-y-1">
                <p>
                  <strong>Category:</strong> <Badge variant="secondary">{profile.category}</Badge>
                </p>
                <p>
                  <strong>Nationality:</strong> {profile.nationality}
                </p>
              </div>
            </div>
          </div>

          {profile.nationality === 'Indian' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Indian Resident Details</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {profile.aadhaar_number && (
                  <p>
                    <strong>Aadhaar:</strong> {profile.aadhaar_number}
                  </p>
                )}
                {profile.abc_id_number && (
                  <p>
                    <strong>ABC ID:</strong> {profile.abc_id_number}
                  </p>
                )}
              </div>
            </div>
          )}

          {profile.financial_background && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Financial Background</p>
              <p className="text-sm">{profile.financial_background}</p>
            </div>
          )}

          {profile.interests && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Interests/Field of Study</p>
              <p className="text-sm">{profile.interests}</p>
            </div>
          )}

          {profile.income_certificate_url && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Documents</p>
              <a
                href={profile.income_certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Income Certificate
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
