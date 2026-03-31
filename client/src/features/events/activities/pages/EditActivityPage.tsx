import { useParams } from "react-router-dom";
import EditActivityForm from "../components/EditActivityForm.tsx";

export default function EditActivityPage() {
    const { id, eventId } = useParams()
    if (!id || !eventId) {
        return <p>Error: Missing ID</p>;
    }
    return (
        <div>
            <EditActivityForm
                eventId={Number(eventId)}
                activityID={Number(id)}
            />
        </div>
    );
}
