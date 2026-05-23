import { useParams } from "react-router-dom";
import EditRegTypeForm from "../components/EditRegTypeForm";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function EditRegTypePage() {
    const { eventId, regTypeId } = useParams();

    if (!eventId || !regTypeId) {
        return <p>Error: Missing IDs</p>;
    }

    return (
        <div>
            <TopBar/>
            <BackButton/>
            <EditRegTypeForm
                eventID={eventId}
                regTypeID={regTypeId}
            />
        </div>
    );
}