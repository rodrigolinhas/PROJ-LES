import { useParams } from "react-router-dom";
import EditArticleForm from "../components/EditArticleForm";

export default function EditArticlePage() {
    const { eventId, activityId, articleId } = useParams();

    if (!eventId || !activityId || !articleId) {
        return <p>Error: Missing ID</p>;
    }

    return (
        <div>
            <EditArticleForm
                eventId={Number(eventId)}
                activityId={Number(activityId)}
                articleId={Number(articleId)}
            />
        </div>
    );
}