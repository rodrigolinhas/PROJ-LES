import SettingsForm from "../components/SettingsForm";

/**
 * Page for editing the authenticated user's account settings.
 *
 * Renders the SettingsForm component, which handles fetching
 * current user data and submitting updates.
 */
export default function SettingsPage() {
    return (
        <div>
            <SettingsForm />
        </div>
    );
}
