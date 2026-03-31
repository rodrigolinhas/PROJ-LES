import { useState } from "react";

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

type Props = {
    eventId: number;
    activityID: number;
    onDeleted: () => void;
};

export default function DeleteActivityButton({ eventId, activityID, onDeleted }: Props) {
    const [loading, setLoading] = useState(false);

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
            } else {
                alert(await response.text());
            }
        } catch {
            alert("Server error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Activity"}
        </button>
    );
}