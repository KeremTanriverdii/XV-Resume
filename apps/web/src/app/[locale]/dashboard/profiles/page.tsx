import ProfileListClient from "@/components/clientpages/ProfileListClient";
import ProfileCreateForm from "@/components/clientpages/ProfileCreateForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server";

export default async function ProfilesPage() {
    const supabase = await createClient()
    const t = await getTranslations("profiles")
    
    // Güvenlik odaklı server-side kimlik kontrolü
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        redirect("/login")
    }
    const metaData = user.user_metadata;
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    return (
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 w-full">
            <div className="lg:col-span-7 space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                {/* Optimistic form */}
                <ProfileCreateForm token={token} userId={user.id} metaData={metaData} />
            </div>
            
            <div className="lg:col-span-5 space-y-6">
                {/* Profiles list */}
                <ProfileListClient token={token} userId={user.id} />
            </div>
        </main>
    )
}
