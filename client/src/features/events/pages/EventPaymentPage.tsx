import { useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from "@/shared/utils/env";
import TopBar from "@/shared/components/TopBar";
import BackButton from "@/shared/components/BackButton";
import {
    mainDivStyle,
    titleStyle,
    descriptionStyle,
    submitButtonStyle,
    errorMessageStyle,
    successOutDivStyle,
    successDivStyle,
    successMessageStyle,
    goHomeStyle,
    buttonsDivStyle,
} from "@/shared/styles/formStyles";

export default function EventPaymentPage() {
    const { id } = useParams();
    const location = useLocation();
    const payToken: string = location.state?.payToken || "";
    const eventId: string = location.state?.eventId || id || "";

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [paid, setPaid] = useState(false);

    async function handlePay() {
        setLoading(true);
        setMessage("");
        setIsError(false);

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();
        formData.append("eventID", eventId);
        formData.append("payToken", payToken);

        try {
            const res = await fetch(`http://${envHostBackend()}/event/pay`, {
                method: "POST",
                body: formData,
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include",
            });

            if (res.ok) {
                setPaid(true);
                setMessage("Payment confirmed! You are now fully registered.");
                setIsError(false);
            } else {
                const text = await res.text();
                setMessage(text || "Payment failed");
                setIsError(true);
            }
        } catch {
            setMessage("Server error during payment");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }

    if (paid) {
        return (
            <>
            <TopBar />
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Payment Confirmed!</h2>
                    <p className="text-gray-500 mb-4">Your registration has been confirmed successfully.</p>
                    <Link to={`/event/${eventId}`} className={goHomeStyle}>Back to Event</Link>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
        <TopBar />
        <BackButton to={`/event/${eventId}`} />
        <div className={mainDivStyle}>
            <div>
                <h2 className={titleStyle}>💳 Complete Payment</h2>
                <p className={descriptionStyle}>
                    Your enrollment requires payment to be confirmed. Click the button below to complete the process.
                </p>
            </div>

            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Payment Token</p>
                <p className="text-sm font-mono text-gray-700 mt-1 break-all">{payToken || "—"}</p>
            </div>

            <div className={buttonsDivStyle}>
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={loading || !payToken}
                    className={submitButtonStyle + " disabled:opacity-50"}
                >
                    {loading ? "Processing..." : "Confirm Payment"}
                </button>
            </div>

            {message && isError && (
                <p className={errorMessageStyle}>
                    {message}
                </p>
            )}
        </div>
        </>
    );
}
