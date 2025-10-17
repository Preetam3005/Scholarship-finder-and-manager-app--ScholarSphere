import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SiteAdmin = () => {
  const { user } = useAuth();
  type ProfileRow = Database['public']['Tables']['profiles']['Row'];
  const [pending, setPending] = useState<ProfileRow[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPending();
  }, []);

  const isSuperAdmin = () => {
    const env = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || '') as string;
    const emails = env.split(',').map(s => s.trim()).filter(Boolean);
    return user && emails.includes(user.email || '');
  };

  const fetchPending = async () => {
    // Use a non-generic query builder and cast the result to avoid deep TS instantiation errors
    const qb: any = supabase.from('profiles');
    const res = await qb.select('*').eq('is_org', true).eq('is_org_approved', false);
    const { data, error } = res as { data: ProfileRow[] | null; error: any };
    if (error) {
      console.error(error);
      return;
    }
    setPending(data || []);
  };

  const setApproval = async (id: string, approved: boolean) => {
    const profileRes = await supabase.from('profiles').select('email, full_name').eq('id', id).maybeSingle();
    const { data, error } = profileRes as { data: { email: string; full_name: string } | null; error: any };
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch profile', variant: 'destructive' });
      return;
    }

  const updateRes = await (supabase.from('profiles').update({ is_org_approved: approved } as any).eq('id', id));
  const { error: updateErr } = updateRes as { data: any[] | null; error: any };
    if (updateErr) {
      toast({ title: 'Error', description: 'Failed to update approval', variant: 'destructive' });
      return;
    }

    // send email notification
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: approved ? 'Organisation Approved' : 'Organisation Rejected',
          text: approved
            ? `Hello ${data.full_name},\n\nYour organisation registration has been approved. You can now create and manage scholarships.`
            : `Hello ${data.full_name},\n\nWe are sorry to inform you that your organisation registration has been rejected. Please contact support for details.`,
        }),
      });
    } catch (err) {
      console.error('Email send failed', err);
    }

    toast({ title: approved ? 'Approved' : 'Rejected', description: 'Organisation updated' });
    fetchPending();
  };

  if (!isSuperAdmin()) return <div className="p-8">Not authorized</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Site Admin — Organisation Approvals</h1>
      <div className="grid gap-4">
        {pending.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.full_name}</CardTitle>
              <CardDescription>{p.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => setApproval(p.id, true)}>Approve</Button>
                <Button variant="destructive" onClick={() => setApproval(p.id, false)}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteAdmin;
