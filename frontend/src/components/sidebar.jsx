import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const navigate = useNavigate();
    const [doctorInfo, setDoctorInfo] = useState({ name: "dr. Admin", role: "Doctor" });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setDoctorInfo({
                    name: user.name || user.username || "dr. Admin",
                    role: user.department?.name || "Doctor Specialist"
                });
            } catch (e) {
                console.error("Error loading profile details:", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const menus = [
        {
            name: "Dashboard",
            icon: "bi-speedometer2",
            path: "/dashboard",
        },
        {
            name: "New Analysis",
            icon: "bi-file-earmark-medical",
            path: "/analysis",
        },
        {
            name: "Encounters",
            icon: "bi-person-lines-fill",
            path: "/encounters",
        },
        {
            name: "Diagnosis Validation",
            icon: "bi-clipboard2-pulse",
            path: "/diagnosis",
        },
        {
            name: "Transactions",
            icon: "bi-cash-stack",
            path: "/transactions",
        },
        {
            name: "Settings",
            icon: "bi-gear",
            path: "/settings",
        },
    ];

    return (
        <div
            className="d-flex flex-column justify-content-between shadow"
            style={{
                width: "270px",
                minHeight: "100vh",
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                color: "#e2e8f0",
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div>
                {/* Header Logo */}
                <div
                    className="text-center py-4 border-bottom mb-3"
                    style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.01)"
                    }}
                >
                    <h4 className="fw-bold mb-1 text-white d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-shield-check text-primary"></i>
                        <span>BPJS Safe Claim</span>
                    </h4>
                    <small className="text-secondary tracking-wide text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>
                        AI Claim Prevention
                    </small>
                </div>

                {/* Navigation Menu */}
                <div className="px-2">
                    {menus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                `d-flex align-items-center px-4 py-3 my-1 rounded text-decoration-none transition-all duration-200 ${
                                    isActive 
                                    ? "bg-primary text-white shadow-sm font-semibold" 
                                    : "text-secondary hover-bg-dark"
                                }`
                            }
                            style={({ isActive }) => ({
                                transition: "all 0.2s ease-in-out",
                                borderLeft: isActive ? "4px solid #3b82f6" : "4px solid transparent",
                                background: isActive ? "linear-gradient(90deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.02) 100%)" : "transparent"
                            })}
                        >
                            <i
                                className={`bi ${menu.icon} me-3 fs-5`}
                                style={{ transition: "transform 0.2s" }}
                            ></i>
                            <span style={{ fontSize: "0.9rem" }}>{menu.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* User Profile Widget at Bottom */}
            <div className="p-3 border-top" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.15)" }}>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div
                            className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2 fw-bold"
                            style={{
                                width: 40,
                                height: 40,
                                border: "2px solid rgba(255,255,255,0.1)"
                            }}
                        >
                            {doctorInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ maxWidth: "150px" }}>
                            <div className="fw-bold text-white text-truncate small" title={doctorInfo.name}>
                                {doctorInfo.name}
                            </div>
                            <small className="text-secondary d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                                {doctorInfo.role}
                            </small>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        className="btn btn-sm btn-link text-danger p-0 ms-2 text-decoration-none" 
                        onClick={handleLogout}
                        title="Logout dari Sesi"
                    >
                        <i className="bi bi-box-arrow-right fs-4"></i>
                    </button>
                </div>
            </div>

            {/* Sidebar CSS Enhancements */}
            <style>{`
                .hover-bg-dark:hover {
                    background-color: rgba(255, 255, 255, 0.03) !important;
                    color: #fff !important;
                    transform: translateX(4px);
                }
                .hover-bg-dark:hover i {
                    transform: scale(1.15);
                }
                .text-secondary {
                    color: #94a3b8 !important;
                }
                .tracking-wide {
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
}