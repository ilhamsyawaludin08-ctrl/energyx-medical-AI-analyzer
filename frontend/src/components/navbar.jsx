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
            className="bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom shadow-sm"
            style={{
                borderColor: "#e2e8f0",
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* System Title Left */}
            <div>
                <h4 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: "1.25rem" }}>
                    <span>BPJS Claim Prevention System</span>
                    <span 
                        className="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-1 px-2 d-none d-md-flex align-items-center gap-1"
                        style={{ fontSize: "0.7rem", fontWeight: "500" }}
                    >
                        <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: "6px", height: "6px" }}></span>
                        Secured
                    </span>
                </h4>
                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                    AI-Assisted Medical Validation | {userProfile.hospitalName}
                </small>
            </div>

            {/* User Profile Right */}
            <div className="d-flex align-items-center gap-3">
                {/* Notifications icon */}
                <div className="position-relative me-2" style={{ cursor: "pointer" }}>
                    <i className="bi bi-bell text-secondary fs-5 hover-color-primary"></i>
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">New alerts</span>
                    </span>
                </div>

                {/* Divider */}
                <div className="border-start" style={{ height: "30px", borderColor: "#e2e8f0" }}></div>

                {/* Profile Info & Avatar */}
                <div className="d-flex align-items-center">
                    <div className="text-end me-3 d-none d-sm-block">
                        <div className="fw-bold text-dark small" style={{ fontSize: "0.875rem" }}>
                            {userProfile.name}
                        </div>
                        <small className="text-secondary d-block" style={{ fontSize: "0.75rem" }}>
                            {userProfile.role}
                        </small>
                    </div>

                    <div
                        className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold shadow-sm"
                        style={{
                            width: 42,
                            height: 42,
                            border: "2px solid #3b82f6",
                            fontSize: "1.1rem",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {getInitials(userProfile.name)}
                    </div>
                </div>
            </div>

            {/* Custom styling hover micro-animations */}
            <style>{`
                .hover-color-primary:hover {
                    color: #2563eb !important;
                }
            `}</style>
        </div>
    );
}