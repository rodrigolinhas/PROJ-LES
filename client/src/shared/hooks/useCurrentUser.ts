import { useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";
import { envHostBackend } from "../utils/env";

export type CurrentUser = {
    ID: number;
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
};

/**
 * Fetches the authenticated user's full profile from the API.
 *
 * @returns `{ user, loading, error }` — the user object is `null`
 *          while the request is in flight or if it fails.
 */
export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchUser() {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch(
                    `http://${envHostBackend()}/user/me`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken },
                    }
                );
                if (!cancelled) {
                    if (res.ok) {
                        setUser(await res.json());
                    } else {
                        setError("Unauthorized");
                    }
                }
            } catch {
                if (!cancelled) setError("Server error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchUser();
        return () => { cancelled = true; };
    }, []);

    return { user, loading, error };
}
