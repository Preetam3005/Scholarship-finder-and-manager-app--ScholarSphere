import { jsPDF } from 'jspdf';
import { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['applications']['Row'];
type Scholarship = Database['public']['Tables']['scholarships']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ApplicationWithScholarship extends Application {
  scholarships: Scholarship;
}

export const generateApplicationsPDF = async (
  applications: ApplicationWithScholarship[],
  profile: Profile,
  photoUrl?: string
) => {
  const pdf = new jsPDF();
  
  // Add header
  pdf.setFontSize(20);
  pdf.text('My Scholarship Applications', 105, 20, { align: 'center' });
  
  // Add student info
  pdf.setFontSize(12);
  pdf.text(`Name: ${profile.full_name}`, 20, 40);
  pdf.text(`Email: ${profile.email}`, 20, 47);
  pdf.text(`Course: ${profile.course}`, 20, 54);
  pdf.text(`Department: ${profile.department}`, 20, 61);
  pdf.text(`GPA: ${profile.gpa}`, 20, 68);
  
  // Add photo if available
  if (photoUrl) {
    try {
      pdf.addImage(photoUrl, 'JPEG', 160, 35, 30, 30);
    } catch (error) {
      console.error('Error adding photo to PDF:', error);
    }
  }
  
  // Add applications
  let yPos = 85;
  pdf.setFontSize(14);
  pdf.text('Applied Scholarships:', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(10);
  applications.forEach((app, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    
    const scholarship = app.scholarships;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${scholarship.name}`, 20, yPos);
    yPos += 6;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Provider: ${scholarship.provider}`, 25, yPos);
    yPos += 5;
    pdf.text(`Amount: ${scholarship.amount}`, 25, yPos);
    yPos += 5;
    pdf.text(`Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`, 25, yPos);
    yPos += 5;
    pdf.text(`Status: ${app.status}`, 25, yPos);
    yPos += 5;
    pdf.text(`Applied on: ${new Date(app.applied_at).toLocaleDateString()}`, 25, yPos);
    yPos += 10;
  });
  
  // Save the PDF
  pdf.save(`scholarship-applications-${new Date().toISOString().split('T')[0]}.pdf`);
};
