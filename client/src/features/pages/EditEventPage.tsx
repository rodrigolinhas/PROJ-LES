import { useParams } from "react-router-dom";
import EditEventForm from "../forms/EditEventForm.tsx";

export default function EditEventPage() {
    const { id } = useParams()
    return (
        <div>
            <EditEventForm eventID={id}/>
        </div>
    );
}
