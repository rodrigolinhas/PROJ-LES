import CreateArticleForm from "../components/CreateArticleForm.tsx";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function CreateArticlePage() {
    return (
        <>
        <TopBar />
        <BackButton/>
        <div>
            <CreateArticleForm />
        </div>
        </>
    );
}
