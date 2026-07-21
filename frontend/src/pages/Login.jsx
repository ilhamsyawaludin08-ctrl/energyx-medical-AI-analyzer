import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = async (e) => {
    e.preventDefault();

    try {

        const response = await api.post(
            "/v1/user/login",
            {
                username,
                password,
            }
        );

        localStorage.setItem(
            "token",
            response.data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
        );

        navigate("/dashboard");

    } catch (err) {

        console.error(err);
        alert("Username atau Password salah");

    }
};
    return (

    <div
        className="d-flex justify-content-center align-items-center"
        style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f8fafc 100%)",
            position: "relative",
            overflow: "hidden"
        }}
    >
        {/* Decorative background shapes */}
        <div style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.06))",
            pointerEvents: "none"
        }} />
        <div style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(59,130,246,0.04))",
            pointerEvents: "none"
        }} />

        <div
            className="sc-animate-in"
            style={{
                width: "100%",
                maxWidth: "440px",
                background: "var(--sc-bg-card, #ffffff)",
                borderRadius: "var(--sc-radius-xl, 20px)",
                boxShadow: "var(--sc-shadow-xl, 0 25px 50px -12px rgba(0,0,0,0.15))",
                padding: "2.5rem",
                position: "relative",
                zIndex: 1,
                border: "1px solid var(--sc-border, rgba(0,0,0,0.06))"
            }}
        >

            <form onSubmit={handleLogin}>

                {/* Logo Icon */}
                <div className="text-center mb-4">
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "var(--sc-radius-lg, 16px)",
                        background: "var(--sc-primary-gradient, linear-gradient(135deg, #3b82f6, #6366f1))",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
                        marginBottom: "1rem"
                    }}>
                        <i className="bi bi-shield-check" style={{ fontSize: "28px", color: "#fff" }}></i>
                    </div>

                    <h2 style={{
                        fontWeight: 800,
                        color: "var(--sc-text-primary, #1e293b)",
                        fontSize: "1.6rem",
                        marginBottom: "0.35rem",
                        letterSpacing: "-0.02em"
                    }}>
                        BPJS Safe Claim
                    </h2>

                    <p style={{
                        color: "var(--sc-text-secondary, #64748b)",
                        fontSize: "0.9rem",
                        marginBottom: 0
                    }}>
                        Silakan login untuk melanjutkan
                    </p>
                </div>

                {/* Username Input Group */}
                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "var(--sc-text-primary, #1e293b)",
                        marginBottom: "0.5rem"
                    }}>
                        Username
                    </label>

                    <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <i className="bi bi-person" style={{
                            position: "absolute",
                            left: "14px",
                            color: "var(--sc-text-secondary, #94a3b8)",
                            fontSize: "1.1rem",
                            zIndex: 2
                        }}></i>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                paddingLeft: "42px",
                                height: "48px",
                                borderRadius: "var(--sc-radius-md, 12px)",
                                border: "1.5px solid var(--sc-border, #e2e8f0)",
                                fontSize: "0.95rem",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                                background: "var(--sc-bg, #f8fafc)"
                            }}
                        />
                    </div>
                </div>

                {/* Password Input Group */}
                <div style={{ marginBottom: "1.75rem" }}>
                    <label style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "var(--sc-text-primary, #1e293b)",
                        marginBottom: "0.5rem"
                    }}>
                        Password
                    </label>

                    <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <i className="bi bi-lock" style={{
                            position: "absolute",
                            left: "14px",
                            color: "var(--sc-text-secondary, #94a3b8)",
                            fontSize: "1.1rem",
                            zIndex: 2
                        }}></i>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                paddingLeft: "42px",
                                height: "48px",
                                borderRadius: "var(--sc-radius-md, 12px)",
                                border: "1.5px solid var(--sc-border, #e2e8f0)",
                                fontSize: "0.95rem",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                                background: "var(--sc-bg, #f8fafc)"
                            }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn w-100"
                    style={{
                        background: "var(--sc-primary-gradient, linear-gradient(135deg, #3b82f6, #6366f1))",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        height: "50px",
                        borderRadius: "var(--sc-radius-md, 12px)",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        letterSpacing: "0.02em"
                    }}
                >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                </button>

                {/* Footer */}
                <div className="text-center" style={{ marginTop: "2rem" }}>
                    <p style={{
                        color: "var(--sc-text-secondary, #94a3b8)",
                        fontSize: "0.78rem",
                        marginBottom: 0,
                        lineHeight: 1.5
                    }}>
                        © {new Date().getFullYear()} BPJS Safe Claim — Healthcare Fraud Detection
                    </p>
                </div>

            </form>

        </div>

    </div>

);

}