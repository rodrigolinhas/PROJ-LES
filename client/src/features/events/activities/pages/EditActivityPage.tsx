import { useParams } from "react-router-dom";
import EditActivityForm from "../components/EditActivityForm.tsx";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function EditActivityPage() {
    const { id, eventId } = useParams()
    if (!id || !eventId) {
        return <p>Error: Missing ID</p>;
    }
    return (
        <div>
            <TopBar/>
            <BackButton/>
            <EditActivityForm
                eventId={Number(eventId)}
                activityID={Number(id)}
            />
        </div>
    );
}
