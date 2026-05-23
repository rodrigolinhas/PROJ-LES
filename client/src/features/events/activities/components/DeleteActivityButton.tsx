import { useState } from "react";
import { getCookie } from "@/shared/utils/getCookie.ts"
import {deleteButtonStyle} from "@/shared/styles/formStyles.ts";

type Props = {
    eventId: number;
    activityID: number;
    onDeleted: () => void;
};

export default function DeleteActivityButton({ eventId, activityID, onDeleted }: Props) {
    const [loading, setLoading] = useState(false);
    const [, setError] = useState("");

    async function handleDelete() {
        const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
        if (!confirmDelete) return;

        setLoading(true);

        const csrfToken = getCookie("csrf_token") || "";

        try {
            const response = await fetch(
                `http://localhost:8080/event/${eventId}/activity/delete/${activityID}`,
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include"
                }
            );

            if (response.status === 200) {
                onDeleted();
            } else if (response.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else {
                setError(await response.text());
            }
        } catch {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button className={deleteButtonStyle} onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "🗑 Delete Activity"}
        </button>
    );
}
