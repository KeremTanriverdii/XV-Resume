import ProfileListClient from "@/components/clientpages/ProfileListClient";
import ProfileCreateForm from "@/components/clientpages/ProfileCreateForm"
import { fetchProfile } from "@/services/profileService";
import { createClient } from "@/utils/supabase/server"
import { getQueryClient } from "@/providers/get-query-client"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { redirect } from "next/navigation"

export default async function ProfilesPage() {
    const supabase = await createClient()
    
    // Güvenlik odaklı server-side kimlik kontrolü
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        redirect("/login")
    }

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const queryClient = getQueryClient()

    if (token) {
        await queryClient.prefetchQuery({
            queryKey: ['profiles', user.id],
            queryFn: () => fetchProfile(token)
        })
    }

    return (
        <main className="flex w-full flex-1 flex-col gap-6 p-4">
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
            </div>
            
            {/* İyimser güncelleme (optimistic update) destekli form */}
            <ProfileCreateForm token={token} userId={user.id} />
            
            {/* Server'dan gelen token ve userId prop olarak iletiliyor */}
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProfileListClient token={token} userId={user.id} />
            </HydrationBoundary>
        </main>
    )
}
