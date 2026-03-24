import { useParams } from "react-router-dom";
import EditActivityForm from "../components/EditActivityForm.tsx";

export default function EditActivityPage() {
    const { id } = useParams()
    return (
        <div>
            <EditActivityForm activityID={id}/>
        </div>
    );
}
