import { useParams } from "react-router-dom";
import CreateRegTypeForm from "../components/CreateRegTypeForm";

export default function CreateRegTypePage() {
    const { eventId } = useParams<{ eventId: string }>();

    return (
        <div>
            <CreateRegTypeForm eventID={eventId} />
        </div>
    );
}