import { useParams } from "react-router-dom";
import CreateRegTypeForm from "../components/CreateRegTypeForm";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function CreateRegTypePage() {
    const { eventId } = useParams<{ eventId: string }>();

    return (
        <>
        <TopBar />
        <BackButton/>
        <div>
            <CreateRegTypeForm eventID={eventId} />
        </div>
        </>
    );
}