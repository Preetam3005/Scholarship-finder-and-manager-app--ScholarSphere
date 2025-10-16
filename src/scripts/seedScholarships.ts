import { supabase } from '@/integrations/supabase/client';
import { sampleScholarships } from '@/data/sampleScholarships';

export const seedScholarships = async () => {
  try {
    // Check if scholarships already exist
    const { data: existing, error: checkError } = await supabase
      .from('scholarships')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking scholarships:', checkError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('Scholarships already seeded');
      return;
    }

    // Insert sample scholarships
    const { error } = await supabase.from('scholarships').insert(sampleScholarships);

    if (error) {
      console.error('Error seeding scholarships:', error);
      return;
    }

    console.log('Successfully seeded', sampleScholarships.length, 'scholarships');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};
