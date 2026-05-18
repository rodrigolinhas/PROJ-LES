import { useState } from "react";
import { getCookie } from "@/shared/utils/getCookie.ts";
import { envHostBackend } from '@/shared/utils/env';
import {deleteButtonStyle} from "@/shared/styles/formStyles.ts";

export default function DeleteRegTypeButton(props: any) {
    let eventID: number = props.eventID;
    let regTypeID: number = props.regTypeID;
    let setRegTypeDeleted = props.setRegTypeDeleted;

    const [title, setTitle] = useState("🗑 Delete Registration Type");

    async function handleClick() {
        const confirmDelete = window.confirm("Are you sure you want to delete this registration type?");
        if (!confirmDelete) return;

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("eventID", eventID.toString());
        formData.append("regTypeID", regTypeID.toString());

        try {
            const response = await fetch(`http://`+ envHostBackend() + `/event/regtype/delete`, {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include",
                    body: formData
                }
            );

            if (response.status === 200) {
                setTitle("Registration Type Deleted!");
                setRegTypeDeleted(true)
            } else if (response.status === 401) {
                setTitle("Your session has expired. Please log in again.");
            } else {
                setTitle(await response.text());
            }
        }
        catch(error) {
            setTitle("Server error");
        }
    }

    return (
        <div>
            <button
                className={deleteButtonStyle}
                type='button'
                onClick={handleClick}
            >
            {title}
            </button>
        </div>
    );
}
