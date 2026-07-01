const url = process.env.NEXT_PUBLIC_API_URL;

export const fetchProfile = async (token: string | undefined) => {
    if (!token) return null; // if token is not defined, return null

    const res = await fetch(`${url}/profiles`, {
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

export const createProfile = async (data: any, token: string | undefined) => {
    if (!token) return null;

    const res = await fetch(`${url}/profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        console.error("Failed to create profile", res.statusText);
        return null;
    }

    return res.json();
}
