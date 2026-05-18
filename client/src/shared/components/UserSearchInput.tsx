import { useState } from "react";
import { getCookie } from "../utils/getCookie";
import { envHostBackend } from "../utils/env";

export type AppUser = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

interface UserSearchInputProps {
    onSelectUser: (user: AppUser) => void;
    buttonText?: string;
    excludeUserIds?: number[];
}

export default function UserSearchInput({
    onSelectUser,
    buttonText = "Select",
    excludeUserIds = []
}: UserSearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError("");
        setHasSearched(true);
        const csrfToken = getCookie("csrf_token");

        try {
            const res = await fetch(`http://${envHostBackend()}/user/search?query=${encodeURIComponent(query)}`, {
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include"
            });

            if (res.status === 200) {
                const data = await res.json();
                setResults(data.map((u: any) => ({
                    id: u.ID || u.id,
                    firstName: u.FirstName || u.firstName || u.first_name || "",
                    lastName: u.LastName || u.lastName || u.last_name || "",
                    email: u.Email || u.email || "",
                })));
                setSelectedUserId("");
            } else {
                setError("Failed to search users");
            }
        } catch {
            setError("Server error during search");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = () => {
        if (!selectedUserId) return;
        const user = results.find(u => u.id.toString() === selectedUserId);
        if (user) {
            onSelectUser(user);
        }
    };

    const filteredResults = results.filter(u => !excludeUserIds.includes(u.id));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fdfdfd" }}>
            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setHasSearched(false);
                    }}
                    placeholder="Search users by name or email..."
                    style={{ flex: 1, padding: "8px" }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                />
                <button type="button" onClick={() => handleSearch()} disabled={loading}>
                    {loading ? "Searching..." : "Search Users"}
                </button>
            </div>
            
            {error && <p className="error" style={{ margin: 0, fontSize: "0.9em" }}>{error}</p>}
            
            {results.length > 0 && (
                <div style={{ display: "flex", gap: "10px" }}>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        style={{ flex: 1, padding: "8px" }}
                    >
                        <option value="">Select a user from results...</option>
                        {filteredResults.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.email})
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={handleSelect} disabled={!selectedUserId}>
                        {buttonText}
                    </button>
                </div>
            )}
            {hasSearched && results.length === 0 && !loading && !error && (
                <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>No users found for "{query}"</p>
            )}
            {hasSearched && results.length > 0 && filteredResults.length === 0 && (
                <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>All matching users are already selected or excluded.</p>
            )}
        </div>
    );
}
