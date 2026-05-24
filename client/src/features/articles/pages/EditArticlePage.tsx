import { useParams } from "react-router-dom";
import EditArticleForm from "../components/EditArticleForm";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

export default function EditArticlePage() {
    const { eventId, activityId, articleId } = useParams();

    if (!eventId || !activityId || !articleId) {
        return <p>Error: Missing ID</p>;
    }

    return (
        <>
        <TopBar />
        <BackButton/>
        <div>
            <EditArticleForm
                eventId={Number(eventId)}
                activityId={Number(activityId)}
                articleId={Number(articleId)}
            />
        </div>
        </>
    );
}