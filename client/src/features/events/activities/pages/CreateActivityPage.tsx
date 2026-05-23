import CreateActivityForm from "../components/CreateActivityForm.tsx";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function CreateActivityPage() {
    return (
        <>
        <TopBar />
        <BackButton/>
        <div>
            <CreateActivityForm />
        </div>
        </>
    );
}
