import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from "@/shared/utils/env";

type Beneficiary = {
    ID: number
    FirstName: string
    LastName: string
    Email: string
}

export default function ListBenefitsPage() {
    const { id } = useParams();
    const [benefits, setBenefits] = useState<string[]>([]);
    const [hovered, setHovered] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchParticipants() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/view/${id}/benefits`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setBenefits(data);
                } else {
                    const text = await response.text();
                    setError(text || "Failed to load benefits");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchParticipants();
    }, [id]);

    async function handleBeneficiariesCSV(benefitName: string) {
        const csrfToken = getCookie("csrf_token")

        let data: Beneficiary[] | null = null;

        const response = await fetch(
            `http://${envHostBackend()}/event/view/${id}/benefit_participants/${benefitName}`,
            {
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken,
                },
            }
        )

        if (response.status === 200) {
            data = await response.json();
        } else {
            console.log(await response.text())
        }

        if (data === null || data == undefined) { return }

        const csvRows = ["ID,FirstName,LastName,Email"]
        data.forEach(elem => {
            const row = [
                elem.ID,
                `"${(elem.FirstName || "")}"`,
                `"${(elem.LastName || "")}"`,
                `"${(elem.Email || "")}"`
            ]
            csvRows.push(row.join(","))
        })

        const csvStr = csvRows.join("\n")
        const blob = new Blob([csvStr], {type: "text/csv; charset=utf-8;"})
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `beneficiaries_${id}_${benefitName}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="m-auto max-w-[80%] border-3 p-5 pb-8 rounded-xl bg-white">
            <h2 className="mt-2">Benefits</h2>

            {benefits.length === 0 ? (
                <p>No benefits found.</p>
            ) : (
                <ul className="my-3 mb-8 ml-5 list-disc">
                    {benefits.map((bene) => (
                        <li className="mb-0 h-8 content-center" onMouseEnter={() => setHovered(bene)} onMouseLeave={() => setHovered("")}>
                                {bene} {bene === hovered && 
                                    <button onClick={() => handleBeneficiariesCSV(bene)} className="ml-3 w-58 border-2 border-black gap-2 rounded-md bg-white px-2! py-1! text-black">
                                        Export Beneficiaries as CSV
                                    </button>
                                }
                        </li>
                    ))}
                </ul>
            )}

            <Link className="mr-3 mt-5 w-30 text-center items-center gap-2 rounded-md bg-black px-5 py-3 text-white" to={`/event/${id}`}>Back to Event</Link>
        </div>
    );
}
