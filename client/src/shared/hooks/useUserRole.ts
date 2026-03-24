import { useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";

/**
 * Custom hook that fetches the authenticated user's role from the API.
 *
 * @returns The user's numeric role, or `null` while loading / on error.
 *
 * Role values (as defined by the backend):
 * - '1' - Student
 * - '2' - Professor
 * - `3` — Event organizer
 */
export function useUserRole(): number | null {
    const [role, setRole] = useState<number | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch("http://localhost:8080/user/me", {
                    credentials: "include",
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setRole(data.role);
                }
            } catch (err) {
                console.error("Failed to fetch user role", err);
            }
        };
        fetchRole();
    }, []);

    return role;
}
