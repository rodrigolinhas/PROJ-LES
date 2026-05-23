import CreateEventForm from "../components/CreateEventForm.tsx";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function CreateEventPage() {
    return (
        <>
        <TopBar />
        <BackButton/>
        <div>
            <CreateEventForm />
        </div>
        </>
    );
}
