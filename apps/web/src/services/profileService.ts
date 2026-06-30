export const fetchProfile = async (userId: string | undefined, token: string | undefined) => {
    if (!userId || !token) return null;

    const res = await fetch(`http://localhost:5000/api/profiles?userId=${userId}`, {
        next: { revalidate: 60 },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!res.ok) {
        console.error("Failed to fetch user's profile", res.statusText);
        return null;
    }

    return res.json();
}