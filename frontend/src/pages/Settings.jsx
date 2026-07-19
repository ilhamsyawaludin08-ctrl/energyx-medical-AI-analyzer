import { useState, useEffect } from "react";
import api from "../api/api";

export default function Settings() {
    // Loaded states
    const [profile, setProfile] = useState({ name: "", username: "", email: "", department: "", hospital: {} });
    const [loading, setLoading] = useState(false);
    
    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    // AI config display
    const [aiModel, setAiModel] = useState("gpt-4o-mini");
    const [litellmStatus, setLitellmStatus] = useState("Connected");

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setProfile({
                    name: user.name || "-",
                    username: user.username || "-",
                    email: user.email || "-",
                    department: user.department?.name || "Doctor Specialist",
                    hospital: user.hospital || { name: "RSI Muhammadiyah Kendal", hospital_code: "460261", address: "Semarang" }
                });
            } catch (e) {
                console.error("Failed to load user settings profile:", e);
            }
        }
    }, []);

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Password baru dan konfirmasi password tidak cocok!");
            return;
        }

        if (passwordData.newPassword.length < 4) {
            alert("Password baru harus minimal 4 karakter!");
            return;
        }

        try {
            setLoading(true);
            const response = await api.patch("/v1/user/update-password", {
                password: passwordData.newPassword
            });
            
            if (response.data && response.data.success) {
                alert("Password berhasil diperbarui!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                alert("Gagal memperbarui password: " + (response.data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Password update error:", err);
            const errMsg = err.response?.data?.message || err.message || "Terjadi kesalahan";
            alert("Gagal memperbarui password: " + errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-primary mb-1">
                    <i className="bi bi-gear me-2"></i>
                    Settings
                </h2>
                <p className="text-muted mb-0">Konfigurasi akun dokter, detail rumah sakit, dan pengaturan model AI.</p>
            </div>

            <div className="row g-4">
                {/* Profile Card & Password Update (Left Column) */}
                <div className="col-lg-6">
                    {/* User Profile Card */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                Profil Dokter
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold fs-3 shadow" style={{ width: 60, height: 60 }}>
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1 text-dark">{profile.name}</h5>
                                    <span className="badge bg-light text-dark border">{profile.department}</span>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="text-secondary small d-block">Username</label>
                                    <strong className="text-dark">{profile.username}</strong>
                                </div>
                                <div className="col-sm-6">
                                    <label className="text-secondary small d-block">Email Address</label>
                                    <strong className="text-dark">{profile.email}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-shield-lock me-2 text-primary"></i>
                                Ganti Password
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleUpdatePassword}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Password Baru</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        placeholder="Masukkan password baru..."
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        placeholder="Ketik ulang password baru..."
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Perbarui Password"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Hospital settings & AI Models (Right Column) */}
                <div className="col-lg-6">
                    {/* Hospital Info */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-hospital me-2 text-primary"></i>
                                Identitas Rumah Sakit
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-secondary small d-block">Nama Instansi</label>
                                <strong className="text-dark fs-6">{profile.hospital?.name || "RSI Muhammadiyah Kendal"}</strong>
                            </div>
                            <div className="mb-3">
                                <label className="text-secondary small d-block">Kode Rumah Sakit (BPJS Registrasi)</label>
                                <code className="fs-6">{profile.hospital?.hospital_code || "460261"}</code>
                            </div>
                            <div className="mb-3">
                                <label className="text-secondary small d-block">Alamat</label>
                                <span className="text-dark small d-block">{profile.hospital?.address || "Semarang"}</span>
                            </div>
                            <div>
                                <label className="text-secondary small d-block">Client API Key Signature</label>
                                <code className="small text-truncate d-block text-muted" style={{ maxWidth: "100%", wordBreak: "break-all" }}>
                                    4ec46f92c5571cd4a8e88650a5d06b6455fa424a0edee2d34eb75c7a26bf492e
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* AI Model config */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-cpu me-2 text-primary"></i>
                                Pengaturan Analisis AI
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Model AI Utama</label>
                                <select className="form-select" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                                    <option value="gpt-4o-mini">GPT-4o Mini (Default, Hemat Token)</option>
                                    <option value="gpt-4o">GPT-4o (Analisis Medis Akurasi Tinggi)</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-muted">Status Koneksi LiteLLM:</span>
                                <span className="badge bg-success-subtle text-success border border-success p-2">
                                    <i className="bi bi-cloud-check-fill me-1"></i> {litellmStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Validation Penalty info */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-shield-check me-2 text-primary"></i>
                                Rules Engine Parameter (Read-only)
                            </h5>
                        </div>
                        <div className="card-body py-2">
                            <ul className="list-group list-group-flush small">
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Pinalti Diagnosis di Luar AI</span>
                                    <span className="text-danger fw-semibold">-15%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Pinalti Coherence Gejala Rendah</span>
                                    <span className="text-danger fw-semibold">-20%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Pinalti Linkage Tindakan Buruk</span>
                                    <span className="text-danger fw-semibold">-15%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Pinalti Kelalaian Berkas Wajib</span>
                                    <span className="text-danger fw-semibold">-10% per berkas</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}