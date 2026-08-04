import ProfilesContainer from '@/components/clientpages/ProfilesContainer';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metaData = user?.user_metadata;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  return (
    <ProfilesContainer token={token} userId={user?.id} metaData={metaData} />
  );
}
