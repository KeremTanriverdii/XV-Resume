import ProfileTestClient from "@/components/clientpages/ProfileTestClient"

export default async function ProfilesPage() {
    return (
        <main className="flex w-full flex-1 flex-col gap-4 lg:gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Profiles</h1>
            </div>
            <ProfileTestClient />
        </main>
    )
}