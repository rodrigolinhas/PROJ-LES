import { envHostBackend } from '@/shared/utils/env';
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

export default function PublishEventButton(props: any) {
    let eventID: number = props.eventID
    let published: boolean = props.published

    const [title, setTitle] = useState("⏏ Publish Event");
    const [done, setDone] = useState(published);

    async function handleClick() {
        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("eventID", eventID.toString());

        try {
            const response = await fetch("http://" + envHostBackend() + "/event/publish", {
                method: "POST", 
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 200) {
                setTitle("Event Published!");
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
