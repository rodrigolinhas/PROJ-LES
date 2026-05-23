import { useParams } from "react-router-dom";
import EditEventForm from "../components/EditEventForm.tsx";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function EditEventPage() {
    const { id } = useParams()
    return (
        <div>
            <TopBar/>
            <BackButton/>
            <EditEventForm eventID={id}/>
        </div>
    );
}
