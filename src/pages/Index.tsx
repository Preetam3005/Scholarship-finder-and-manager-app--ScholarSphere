import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Search, FileText, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Scholarship Finder</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>Login / Sign Up</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">
              Find Your Perfect <span className="text-primary">Scholarship</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and apply for scholarships in one place. We match you with opportunities based on your profile and manage all your applications seamlessly.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Learn More
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <Search className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Filter scholarships by category, GPA, degree level, and more to find the perfect match.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <FileText className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">One-Click Apply</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is auto-filled for every application. No more repetitive form filling.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <Award className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor all your applications in one dashboard and get deadline reminders.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
