import { useState } from 'react';

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

/*
TODO

When doing another pass on this component make sure to ask the user to confirm
before doing this action
*/

export default function DeleteActivityButton(props: any) {
    let activityID: number = props.activityID
    let setActivityDeleted = props.setActivityDeleted

    const [title, setTitle] = useState("Delete Activity");

    async function handleClick() {
        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("activityID", activityID.toString());

        try {
            const response = await fetch("http://localhost:8080/activity/delete", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 200) {
                setTitle("Activity Deleted!");
                setActivityDeleted(true)
            }
            else {
                const errorText = await response.text();
                setTitle(errorText);
            }
        }
        catch(error) {
            setTitle("Server error");
        }
    }

    return (
        <div>
            <button
                type='button'
                onClick={handleClick}
            >
                {title}
            </button>
        </div>
    )
}
