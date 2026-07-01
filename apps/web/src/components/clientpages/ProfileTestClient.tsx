"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { fetchProfile, createProfile } from "@/services/profileService"

export default function ProfileTestClient() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [status, setStatus] = useState<string>("")
    const [profileName, setProfileName] = useState("")
    const [fullName, setFullName] = useState("")

    const getToken = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token
    }

    const handleFetch = async () => {
        setStatus("Fetching...")
        const token = await getToken()
        const data = await fetchProfile(token)
        console.log("fetchProfile result:", data)
        setProfiles(data ?? [])
        setStatus(data ? `✅ ${data.length} profile(s) fetched` : "❌ No data or error")
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("Creating...")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()

        const payload = {
            profileName: profileName || `${fullName}'s Profile`,
            fullName,
            title: "",
            email: "",
            phone: "",
            summary: "",
            skills: [],
            socialLinks: [],
        }

        const res = await createProfile(payload, session?.access_token)
        console.log("createProfile result:", res)

        if (res) {
            setStatus(`✅ Profile created: ${res.profileName}`)
            setProfileName("")
            setFullName("")
            await handleFetch()
        } else {
            setStatus("❌ Create failed — check console")
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-lg">
            <h2 className="text-xl font-bold">🧪 Profile API Test</h2>

            {/* Status */}
            {status && (
                <div className="px-3 py-2 rounded bg-muted text-sm font-mono">
                    {status}
                </div>
            )}

            {/* Create Form */}
            <form onSubmit={handleCreate} className="space-y-3 border rounded-lg p-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Create Profile</h3>
                <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Profile Name (optional)"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                />
                <button type="submit" className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90">
                    POST /profiles
                </button>
            </form>

            {/* Fetch Button */}
            <button
                onClick={handleFetch}
                className="w-full border rounded px-4 py-2 text-sm font-medium hover:bg-muted"
            >
                GET /profiles
            </button>

            {/* Results */}
            {profiles.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Results</h3>
                    {profiles.map((p: any) => (
                        <div key={p.id} className="border rounded p-3 text-sm space-y-1">
                            <p className="font-semibold">{p.profileName}</p>
                            <p className="text-muted-foreground">{p.fullName}</p>
                            <p className="font-mono text-xs text-muted-foreground">{p.userId}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
