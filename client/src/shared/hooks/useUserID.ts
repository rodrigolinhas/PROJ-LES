import { useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";

/**
 * Custom hook that fetches the authenticated user's ID from the API.
 *
 * @returns The user's numeric ID, or `null` while loading / on error.
 */
export function useUserID(): number | null {
    const [id, setID] = useState<number | null>(null);

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
                    setID(Number.parseInt(data.ID));
                }
            } catch (err) {
                console.error("Failed to fetch user ID", err);
            }
        };
        fetchRole();
    }, []);

    return id;
}
