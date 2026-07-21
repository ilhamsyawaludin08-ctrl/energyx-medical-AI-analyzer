import { useEffect, useState } from "react";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState({
        name: "Admin",
        role: "Doctor",
        hospitalName: "RSI Muhammadiyah Kendal"
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserProfile({
                    name: user.name || user.username || "Admin",
                    role: user.department?.name || "Doctor Specialist",
                    hospitalName: user.hospital?.name || "RSI Muhammadiyah Kendal"
                });
            } catch (e) {
                console.error("Failed to parse user details in navbar:", e);
            }
        }
    }, []);

    // Get initials for profile avatar
    const getInitials = (name) => {
        if (!name) return "A";
        // Remove common medical prefix "dr." or "dr. " for avatar initials if present
        const cleanedName = name.replace(/^dr\.\s*/i, "");
        return cleanedName.charAt(0).toUpperCase();
    };

    return (
        <div
            style={{
                background: "var(--sc-bg-card, #FFFFFF)",
                borderBottom: "1px solid var(--sc-border, #E5E7EB)",
                padding: "14px 28px",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 5
            }}
        >
            {/* System Title Left */}
            <div>
                <div className="d-flex align-items-center gap-2" style={{ marginBottom: "2px" }}>
                    <h4
                        className="mb-0 fw-bold"
                        style={{
                            fontSize: "1.15rem",
                            color: "var(--sc-text-primary, #111827)",
                            letterSpacing: "-0.01em"
                        }}
                    >
                        BPJS Claim Prevention System
                    </h4>
                    <span
                        className="d-none d-md-inline-flex align-items-center gap-1"
                        style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            color: "var(--sc-success, #22C55E)",
                            background: "rgba(34, 197, 94, 0.08)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                            borderRadius: "var(--sc-radius-pill, 100px)",
                            padding: "3px 10px"
                        }}
                    >
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--sc-success, #22C55E)",
                                display: "inline-block",
                                animation: "sc-pulse-dot 2s infinite"
                            }}
                        ></span>
                        Secured
                    </span>
                </div>
                <small
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--sc-text-secondary, #6B7280)"
                    }}
                >
                    AI-Assisted Medical Validation | {userProfile.hospitalName}
                </small>
            </div>

            {/* User Profile Right */}
            <div className="d-flex align-items-center gap-3">
                {/* Notifications icon */}
                <div
                    className="sc-nav-bell position-relative"
                    style={{
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "var(--sc-radius-sm, 8px)",
                        transition: "all 0.2s ease"
                    }}
                >
                    <i
                        className="bi bi-bell"
                        style={{
                            fontSize: "1.2rem",
                            color: "var(--sc-text-secondary, #6B7280)",
                            transition: "color 0.2s ease"
                        }}
                    ></i>
                    <span
                        style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--sc-danger, #EF4444)",
                            border: "2px solid var(--sc-bg-card, #FFFFFF)"
                        }}
                    >
                        <span className="visually-hidden">New alerts</span>
                    </span>
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: "1px",
                        height: "32px",
                        background: "var(--sc-border, #E5E7EB)"
                    }}
                ></div>

                {/* Profile Info & Avatar */}
                <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                    <div className="text-end d-none d-sm-block">
                        <div
                            className="fw-semibold"
                            style={{
                                fontSize: "0.85rem",
                                color: "var(--sc-text-primary, #111827)",
                                lineHeight: 1.3
                            }}
                        >
                            {userProfile.name}
                        </div>
                        <small
                            className="d-block"
                            style={{
                                fontSize: "0.72rem",
                                color: "var(--sc-text-secondary, #6B7280)"
                            }}
                        >
                            {userProfile.role}
                        </small>
                    </div>

                    <div
                        className="d-flex justify-content-center align-items-center fw-bold text-white"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--sc-radius-sm, 8px)",
                            background: "var(--sc-primary-gradient, linear-gradient(135deg, #2563EB, #1e40af))",
                            fontSize: "1rem",
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                            transition: "var(--sc-transition, all 0.2s ease)"
                        }}
                    >
                        {getInitials(userProfile.name)}
                    </div>
                </div>
            </div>

            {/* Custom styling hover micro-animations */}
            <style>{`
                .sc-nav-bell:hover {
                    background: rgba(37, 99, 235, 0.06);
                }
                .sc-nav-bell:hover i {
                    color: var(--sc-primary, #2563EB) !important;
                }
                @keyframes sc-pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}