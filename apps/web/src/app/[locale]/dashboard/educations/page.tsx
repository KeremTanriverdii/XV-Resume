import EducationListClient from "@/components/clientpages/EducationListClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EducationsPage() {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect("/login");
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const t = await getTranslations("educations");

    return (
        <main className="flex w-full flex-1 flex-col gap-6 p-4">
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            </div>
            
            <EducationListClient token={token} userId={user.id} />
        </main>
    );
}
