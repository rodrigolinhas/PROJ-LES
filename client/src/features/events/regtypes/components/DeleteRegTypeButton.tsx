import { useState } from "react";
import { getCookie } from "@/shared/utils/getCookie.ts";

type Props = {
    eventId: string | number;
    regTypeId: number;
    onDeleted: () => void;
};

export default function DeleteRegTypeButton({ eventId, regTypeId, onDeleted }: Props) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        const confirmDelete = window.confirm("Are you sure you want to delete this registration type?");
        if (!confirmDelete) return;

        setLoading(true);

        const csrfToken = getCookie("csrf_token") || "";

        const formData = new FormData();
        formData.append("eventID", eventId.toString());
        formData.append("regTypeID", regTypeId.toString());

        try {
            const response = await fetch(
                "http://"+ envHostBackend() + "/event/regtype/delete",
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include",
                    body: formData
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
        <button onClick={handleDelete} disabled={loading} style={{ color: "red", marginLeft: "10px" }}>
            {loading ? "Deleting..." : "Delete"}
        </button>
    );
}
