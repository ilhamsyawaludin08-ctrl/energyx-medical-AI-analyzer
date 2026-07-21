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
            name: "Users",
            icon: "bi-people",
            path: "/users",
        },
        {
            name: "Master Data",
            icon: "bi-database",
            subMenu: [
                {
                    name: "ICD-10",
                    icon: "bi-journal-medical",
                    path: "/master/icd10"
                },
                {
                    name: "INA-CBG",
                    icon: "bi-clipboard2-pulse",
                    path: "/master/inacbg"
                }
            ]
        },
        {
            name: "Settings",
            icon: "bi-gear",
            path: "/settings",
        },
    ];

    return (
        <div
            className="d-flex flex-column justify-content-between"
            style={{
                width: "272px",
                minHeight: "100vh",
                background: "linear-gradient(180deg, #0a1628 0%, #132036 50%, #0f172a 100%)",
                color: "#cbd5e1",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
                position: "relative",
                zIndex: 10
            }}
        >
            <div>
                {/* Header Logo */}
                <div
                    className="text-center py-4"
                    style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: "linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)",
                        marginBottom: "8px"
                    }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center gap-2 mb-2"
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "var(--sc-radius-sm, 8px)",
                                background: "var(--sc-primary-gradient, linear-gradient(135deg, #2563EB, #1e40af))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                            }}
                        >
                            <i className="bi bi-shield-check text-white" style={{ fontSize: "1.1rem" }}></i>
                        </div>
                        <h4
                            className="fw-bold mb-0 text-white"
                            style={{ fontSize: "1.15rem", letterSpacing: "-0.01em" }}
                        >
                            BPJS Safe Claim
                        </h4>
                    </div>
                    <small
                        style={{
                            fontSize: "0.65rem",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "#64748b",
                            fontWeight: 500
                        }}
                    >
                        AI Claim Prevention
                    </small>
                </div>

                {/* Section Label */}
                <div
                    style={{
                        padding: "8px 24px 6px",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "#475569"
                    }}
                >
                    Navigation
                </div>

                {/* Navigation Menu */}
                <div style={{ padding: "0 12px" }}>
                    {menus.map((menu) => {
                        if (menu.subMenu) {
                            return (
                                <div key={menu.name} className="mb-2">
                                    <div
                                        className="sc-sidebar-item d-flex align-items-center justify-content-between text-decoration-none sc-sidebar-inactive"
                                        style={{
                                            padding: "11px 16px",
                                            borderRadius: "var(--sc-radius-pill, 100px)",
                                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                            borderLeft: "3px solid transparent",
                                            color: "#94a3b8",
                                            fontWeight: 400,
                                            fontSize: "0.875rem",
                                            cursor: "pointer"
                                        }}
                                        onClick={(e) => {
                                            const el = e.currentTarget.nextElementSibling;
                                            if (el.style.display === 'none') {
                                                el.style.display = 'block';
                                                e.currentTarget.querySelector('.bi-chevron-down').style.transform = 'rotate(180deg)';
                                            } else {
                                                el.style.display = 'none';
                                                e.currentTarget.querySelector('.bi-chevron-down').style.transform = 'rotate(0deg)';
                                            }
                                        }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className={`bi ${menu.icon}`} style={{ fontSize: "1.25rem", marginRight: "14px", width: "24px", textAlign: "center" }}></i>
                                            <span>{menu.name}</span>
                                        </div>
                                        <i className="bi bi-chevron-down" style={{ transition: 'transform 0.2s', fontSize: '0.8rem' }}></i>
                                    </div>
                                    <div style={{ display: 'none', paddingLeft: '24px', marginTop: '4px' }}>
                                        {menu.subMenu.map(sub => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                className={({ isActive }) =>
                                                    `sc-sidebar-item d-flex align-items-center text-decoration-none ${
                                                        isActive
                                                        ? "sc-sidebar-active"
                                                        : "sc-sidebar-inactive"
                                                    }`
                                                }
                                                style={({ isActive }) => ({
                                                    padding: "8px 16px",
                                                    marginBottom: "2px",
                                                    borderRadius: "var(--sc-radius-pill, 100px)",
                                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    background: isActive ? "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.06) 100%)" : "transparent",
                                                    color: isActive ? "#ffffff" : "#94a3b8",
                                                    fontWeight: isActive ? 600 : 400,
                                                    fontSize: "0.85rem"
                                                })}
                                            >
                                                <i className={`bi ${sub.icon}`} style={{ fontSize: "1.1rem", marginRight: "12px", width: "20px", textAlign: "center" }}></i>
                                                <span>{sub.name}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={menu.path}
                                to={menu.path}
                                className={({ isActive }) =>
                                    `sc-sidebar-item d-flex align-items-center text-decoration-none ${
                                        isActive
                                        ? "sc-sidebar-active"
                                        : "sc-sidebar-inactive"
                                    }`
                                }
                                style={({ isActive }) => ({
                                    padding: "11px 16px",
                                    marginBottom: "2px",
                                    borderRadius: "var(--sc-radius-pill, 100px)",
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    borderLeft: isActive ? "3px solid var(--sc-primary, #2563EB)" : "3px solid transparent",
                                    background: isActive
                                        ? "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.06) 100%)"
                                        : "transparent",
                                    color: isActive ? "#ffffff" : "#94a3b8",
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: "0.875rem"
                                })}
                            >
                                <i
                                    className={`bi ${menu.icon}`}
                                    style={{
                                        fontSize: "1.25rem",
                                        marginRight: "14px",
                                        transition: "transform 0.2s ease",
                                        width: "24px",
                                        textAlign: "center"
                                    }}
                                ></i>
                                <span>{menu.name}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* User Profile Widget at Bottom */}
            <div
                style={{
                    padding: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)"
                }}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                        <div
                            className="d-flex justify-content-center align-items-center fw-bold text-white"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "var(--sc-radius-sm, 8px)",
                                background: "var(--sc-primary-gradient, linear-gradient(135deg, #2563EB, #1e40af))",
                                border: "2px solid rgba(37, 99, 235, 0.4)",
                                fontSize: "1rem",
                                flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                            }}
                        >
                            {doctorInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ marginLeft: "12px", maxWidth: "140px", minWidth: 0 }}>
                            <div
                                className="fw-semibold text-white text-truncate"
                                style={{ fontSize: "0.85rem", lineHeight: 1.3 }}
                                title={doctorInfo.name}
                            >
                                {doctorInfo.name}
                            </div>
                            <small
                                className="d-block text-truncate"
                                style={{ fontSize: "0.7rem", color: "#64748b" }}
                            >
                                {doctorInfo.role}
                            </small>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        className="sc-logout-btn btn btn-sm p-0 ms-2 text-decoration-none border-0 bg-transparent" 
                        onClick={handleLogout}
                        title="Logout dari Sesi"
                        style={{
                            color: "#64748b",
                            transition: "all 0.2s ease",
                            lineHeight: 1,
                            flexShrink: 0
                        }}
                    >
                        <i className="bi bi-box-arrow-right" style={{ fontSize: "1.25rem" }}></i>
                    </button>
                </div>
            </div>

            {/* Sidebar CSS Enhancements */}
            <style>{`
                .sc-sidebar-inactive:hover {
                    background: rgba(255, 255, 255, 0.04) !important;
                    color: #f1f5f9 !important;
                    transform: translateX(4px);
                }
                .sc-sidebar-inactive:hover i {
                    transform: scale(1.15);
                }
                .sc-sidebar-active {
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
                }
                .sc-logout-btn:hover {
                    color: var(--sc-danger, #EF4444) !important;
                    transform: scale(1.1);
                }
                .sc-sidebar-item {
                    position: relative;
                }
                .sc-sidebar-item::after {
                    content: '';
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: transparent;
                    transition: all 0.2s ease;
                }
                .sc-sidebar-active::after {
                    background: var(--sc-primary, #2563EB);
                    box-shadow: 0 0 6px rgba(37, 99, 235, 0.5);
                }
            `}</style>
        </div>
    );
}