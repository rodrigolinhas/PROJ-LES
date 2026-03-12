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

export default function DeleteEventButton(props: any) {
    let eventID: number = props.eventID

    const [title, setTitle] = useState("Delete Event");
    const [done, setDone] = useState(false);

    async function handleClick() {
        const email = localStorage.getItem("userEmail") || "";
        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("email", email);
        formData.append("eventID", eventID.toString());

        try {
            const response = await fetch("http://localhost:8080/event/delete", {
                method: "POST", 
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 200) {
                setTitle("Event Deleted!");
                setDone(true)
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
                disabled={done}
            >
            {title}
            </button>
        </div>
    )
}
