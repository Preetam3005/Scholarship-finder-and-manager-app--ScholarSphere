import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Scholarship = Database['public']['Tables']['scholarships']['Row'];

export const getRecommendedScholarships = (
  profile: Profile,
  scholarships: Scholarship[]
): Scholarship[] => {
  return scholarships
    .filter((scholarship) => {
      // Check GPA requirement
      if (scholarship.min_gpa && profile.gpa < scholarship.min_gpa) {
        return false;
      }

      // Check category match
      if (!scholarship.category.includes(profile.category)) {
        return false;
      }

      // Check if deadline is in the future
      const deadline = new Date(scholarship.deadline);
      if (deadline < new Date()) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by deadline (closest first)
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
};

export const isDeadlineApproaching = (deadline: string): boolean => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
};
