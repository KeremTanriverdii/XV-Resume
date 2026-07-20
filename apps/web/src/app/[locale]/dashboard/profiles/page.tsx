import ProfilesContainer from '@/components/clientpages/ProfilesContainer';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilesPage() {
  const supabase = await createClient();

  // Güvenlik odaklı server-side kimlik kontrolü
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }
  const metaData = user.user_metadata;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  return <ProfilesContainer token={token} userId={user.id} metaData={metaData} />;
}
