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
            background: "#f8fafc"
        }}
    >

        <div
            className="card shadow border-0"
            style={{ width: "420px" }}
        >

            <form
                className="card-body p-5"
                onSubmit={handleLogin}
            >

                <h2 className="fw-bold text-center mb-4 text-primary">
                    <i className="bi bi-shield-check me-2"></i>
                    BPJS Safe Claim
                </h2>

                <p className="text-center text-muted mb-4">
                    Silakan login untuk melanjutkan
                </p>

                <div className="mb-3">

                    <label className="form-label">
                        Username
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Masukkan username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                </div>

                <div className="mb-4">

                    <label className="form-label">
                        Password
                    </label>

                    <input
                        type="password"
                        className="form-control"
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                >
                    Login
                </button>

            </form>

        </div>

    </div>

);

}