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
    const [aiProviderStatus, setAiProviderStatus] = useState("Connected");

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
        <div className="container-fluid sc-animate-in" style={{ padding: "2rem" }}>
            {/* Header */}
            <div className="sc-page-header">
                <h2>
                    <i className="bi bi-gear text-primary me-2"></i>
                    Settings
                </h2>
                <p>Konfigurasi akun dokter, detail rumah sakit, dan pengaturan model AI.</p>
            </div>

            <div className="row g-4">
                {/* Profile Card & Password Update (Left Column) */}
                <div className="col-lg-6">
                    {/* User Profile Card */}
                    <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift sc-stagger-1 sc-card-accent-primary">
                        <div className="sc-section-header d-flex align-items-center gap-2">
                            <i className="bi bi-person-circle text-primary fs-5"></i>
                            <h5 className="mb-0 fw-bold">Profil Dokter</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div 
                                    className="rounded-circle text-white d-flex justify-content-center align-items-center me-3 fw-bold fs-3 shadow-sm" 
                                    style={{ 
                                        width: 64, 
                                        height: 64,
                                        background: "var(--sc-primary-gradient)"
                                    }}>
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1 text-dark fs-5">{profile.name}</h5>
                                    <span className="sc-pill sc-pill-secondary">{profile.department}</span>
                                </div>
                            </div>

                            <div className="row g-4 mt-2">
                                <div className="col-sm-6">
                                    <label className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Username</label>
                                    <strong className="text-dark fs-6 bg-light px-3 py-2 rounded d-block border">{profile.username}</strong>
                                </div>
                                <div className="col-sm-6">
                                    <label className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Email Address</label>
                                    <strong className="text-dark fs-6 bg-light px-3 py-2 rounded d-block border">{profile.email}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card shadow-sm border-0 bg-white sc-hover-lift sc-stagger-2 sc-card-accent-warning">
                        <div className="sc-section-header d-flex align-items-center gap-2">
                            <i className="bi bi-shield-lock text-warning fs-5"></i>
                            <h5 className="mb-0 fw-bold">Ganti Password</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleUpdatePassword}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>Password Baru</label>
                                    <div className="input-group shadow-sm">
                                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-key text-muted"></i></span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 ps-0 form-control-lg"
                                            name="newPassword"
                                            placeholder="Masukkan password baru..."
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>Konfirmasi Password Baru</label>
                                    <div className="input-group shadow-sm">
                                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-key-fill text-muted"></i></span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 ps-0 form-control-lg"
                                            name="confirmPassword"
                                            placeholder="Ketik ulang password baru..."
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2" 
                                    disabled={loading}
                                    style={{
                                        background: "var(--sc-primary-gradient)",
                                        color: "#fff",
                                        borderRadius: "var(--sc-radius-md)",
                                        padding: "0.8rem",
                                        boxShadow: "var(--sc-shadow-sm)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Perbarui Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Hospital settings & AI Models (Right Column) */}
                <div className="col-lg-6">
                    {/* Hospital Info */}
                    <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift sc-stagger-3">
                        <div className="sc-section-header d-flex align-items-center gap-2">
                            <i className="bi bi-hospital text-success fs-5"></i>
                            <h5 className="mb-0 fw-bold">Identitas Rumah Sakit</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4 bg-light p-3 rounded border">
                                <label className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Nama Instansi</label>
                                <strong className="text-dark fs-5">{profile.hospital?.name || "RSI Muhammadiyah Kendal"}</strong>
                            </div>
                            <div className="mb-4 bg-light p-3 rounded border">
                                <label className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Kode Rumah Sakit (BPJS Registrasi)</label>
                                <code className="fs-5 text-primary fw-bold bg-white px-2 py-1 rounded border shadow-sm">{profile.hospital?.hospital_code || "460261"}</code>
                            </div>
                            <div className="mb-4 bg-light p-3 rounded border">
                                <label className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Alamat</label>
                                <span className="text-dark d-block fw-medium">{profile.hospital?.address || "Semarang"}</span>
                            </div>
                            <div className="p-3 bg-dark text-white rounded shadow-sm">
                                <label className="text-white-50 small d-block text-uppercase fw-bold mb-2" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>Client API Key Signature</label>
                                <code className="small d-block text-success font-monospace" style={{ wordBreak: "break-all" }}>
                                    4ec46f92c5571cd4a8e88650a5d06b6455fa424a0edee2d34eb75c7a26bf492e
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* AI Model config */}
                    <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift sc-stagger-4 sc-card-accent-info">
                        <div className="sc-section-header d-flex align-items-center gap-2">
                            <i className="bi bi-cpu text-info fs-5"></i>
                            <h5 className="mb-0 fw-bold">Pengaturan Analisis AI</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>Model AI Utama</label>
                                <select 
                                    className="form-select form-select-lg shadow-sm fw-medium" 
                                    value={aiModel} 
                                    onChange={(e) => setAiModel(e.target.value)}
                                >
                                    <option value="gpt-4o-mini">GPT-4o Mini (Default, Hemat Token)</option>
                                    <option value="gpt-4o">GPT-4o (Analisis Medis Akurasi Tinggi)</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
                                <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>Status Koneksi AI</span>
                                <span className="sc-pill sc-pill-success d-flex align-items-center gap-1 shadow-sm">
                                    <span className="spinner-grow spinner-grow-sm text-success me-1" style={{ width: "10px", height: "10px" }}></span>
                                    {aiProviderStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Validation Penalty info */}
                    <div className="card shadow-sm border-0 bg-white sc-hover-lift sc-stagger-5 sc-card-accent-danger">
                        <div className="sc-section-header d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
                            <h5 className="mb-0 fw-bold">Rules Engine Parameter</h5>
                        </div>
                        <div className="card-body p-4">
                            <ul className="list-group list-group-flush small">
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent">
                                    <span className="fw-medium text-dark"><i className="bi bi-dot text-danger me-1"></i>Pinalti Diagnosis di Luar AI</span>
                                    <span className="sc-pill sc-pill-danger fw-bold">-15%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent">
                                    <span className="fw-medium text-dark"><i className="bi bi-dot text-danger me-1"></i>Pinalti Coherence Gejala Rendah</span>
                                    <span className="sc-pill sc-pill-danger fw-bold">-20%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent">
                                    <span className="fw-medium text-dark"><i className="bi bi-dot text-danger me-1"></i>Pinalti Linkage Tindakan Buruk</span>
                                    <span className="sc-pill sc-pill-danger fw-bold">-15%</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent border-0">
                                    <span className="fw-medium text-dark"><i className="bi bi-dot text-danger me-1"></i>Pinalti Kelalaian Berkas Wajib</span>
                                    <span className="sc-pill sc-pill-danger fw-bold">-10% per berkas</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}