import { useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";
import { envHostBackend } from "../utils/env";

/**
 * Custom hook that fetches the authenticated user's role from the API.
 *
 * @returns The user's as a string, or `null` while loading / on error.
 *
 * Role values (as defined by the backend):
 * - Student
 * - Professor
 * - EventOrganizer
 */
export function useUserRole(): string | null {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch(`http://${envHostBackend()}/user/me`, {
                    credentials: "include",
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setRole(data.Role);
                }
            } catch (err) {
                console.error("Failed to fetch user role", err);
            }
        };
        fetchRole();
    }, []);

    return role;
}
