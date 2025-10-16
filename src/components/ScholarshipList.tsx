import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { getRecommendedScholarships, isDeadlineApproaching } from '@/lib/scholarshipRecommendations';
import { Search, Bookmark, BookmarkCheck, ExternalLink, AlertCircle } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Scholarship = Database['public']['Tables']['scholarships']['Row'];
type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

interface Props {
  profile: Profile;
}

const ScholarshipList = ({ profile }: Props) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDegree, setFilterDegree] = useState('all');
  const [showRecommended, setShowRecommended] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarships();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    filterScholarships();
  }, [scholarships, searchTerm, filterCategory, filterDegree, showRecommended]);

  const fetchScholarships = async () => {
    const { data, error } = await supabase.from('scholarships').select('*').order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching scholarships:', error);
      return;
    }

    setScholarships(data || []);
  };

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', profile.id);

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return;
    }

    setBookmarks(data || []);
  };

  const filterScholarships = () => {
    let filtered = scholarships;

    if (showRecommended) {
      filtered = getRecommendedScholarships(profile, filtered);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((s) => s.category.includes(filterCategory));
    }

    if (filterDegree !== 'all') {
      filtered = filtered.filter((s) => s.degree_level === filterDegree);
    }

    setFilteredScholarships(filtered);
  };

  const handleApply = async (scholarshipId: string) => {
    const { error } = await supabase.from('applications').insert({
      user_id: profile.id,
      scholarship_id: scholarshipId,
      status: 'Applied',
    });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already applied',
          description: 'You have already applied to this scholarship',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to apply',
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'Application submitted!',
      description: 'Your application has been recorded',
    });
  };

  const toggleBookmark = async (scholarshipId: string) => {
    const existing = bookmarks.find((b) => b.scholarship_id === scholarshipId);

    if (existing) {
      const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
      if (!error) {
        setBookmarks(bookmarks.filter((b) => b.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: profile.id, scholarship_id: scholarshipId })
        .select()
        .single();
      if (!error && data) {
        setBookmarks([...bookmarks, data]);
      }
    }
  };

  const isBookmarked = (scholarshipId: string) => {
    return bookmarks.some((b) => b.scholarship_id === scholarshipId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showRecommended ? 'default' : 'outline'}
            onClick={() => setShowRecommended(!showRecommended)}
          >
            {showRecommended ? 'Show All' : 'Recommended'}
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="SC">SC</SelectItem>
              <SelectItem value="ST">ST</SelectItem>
              <SelectItem value="OBC">OBC</SelectItem>
              <SelectItem value="Minority">Minority</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDegree} onValueChange={setFilterDegree}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredScholarships.map((scholarship) => (
          <Card key={scholarship.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleBookmark(scholarship.id)}
                >
                  {isBookmarked(scholarship.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>{scholarship.provider}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{scholarship.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{scholarship.degree_level}</Badge>
                {scholarship.category.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Amount:</strong> {scholarship.amount}
                </p>
                <p>
                  <strong>Min GPA:</strong> {scholarship.min_gpa || 'N/A'}
                </p>
                <p className="flex items-center gap-1">
                  <strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}
                  {isDeadlineApproaching(scholarship.deadline) && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => handleApply(scholarship.id)} className="flex-1">
                Apply Now
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No scholarships found matching your criteria
        </div>
      )}
    </div>
  );
};

export default ScholarshipList;
