import { getQueryClient } from '@/providers/get-query-client';
import { createClient } from '@/utils/supabase/server';
import { fetchProfile } from '@/services/profileService';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import HomePageClient from '@/components/clientpages/HomePageClients';

export default async function LandingPage() {
  const queryClient = getQueryClient();
  const supabase = await createClient();

  // fetch user profile data from supabase
  const {data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const token = session?.access_token;


  await queryClient.prefetchQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user?.id,token)
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient userId={user?.id || undefined} />
    </HydrationBoundary>
  );
}
