import { useParams } from "react-router-dom";
import EditRegTypeForm from "../components/EditRegTypeForm";

export default function EditRegTypePage() {
    const { eventId, regTypeId } = useParams();

    if (!eventId || !regTypeId) {
        return <p>Error: Missing IDs</p>;
    }

    return (
        <div>
            <EditRegTypeForm
                eventID={eventId}
                regTypeID={regTypeId}
            />
        </div>
    );
}