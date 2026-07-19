import { useState } from "react";
import api from "../api/api";

export default function Users() {
    // ----------------------------------------------------
    // TEMPORARY STATIC DATA (Lookup Dropdowns)
    // ----------------------------------------------------
    // Easily replaceable with API calls when endpoints are available.
    const staticHospitals = [
        { id: 1, name: "RSI Muhammadiyah Kendal", hospital_code: "460261" },
        { id: 2, name: "RSUD Dr. Soewondo Kendal", hospital_code: "460262" }
    ];

    const staticDepartments = [
        { id: 1, name: "Poli Umum" },
        { id: 2, name: "Poli Anak" },
        { id: 3, name: "Poli Bedah" },
        { id: 4, name: "IGD" },
        { id: 5, name: "Rawat Inap" }
    ];

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        rs_id: "",
        department_id: "",
        hospital_code: ""
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // If Hospital is selected, automatically update the associated hospital_code
        if (name === "rs_id") {
            const selectedHospital = staticHospitals.find(h => h.id === parseInt(value, 10));
            setFormData(prev => ({
                ...prev,
                rs_id: value,
                hospital_code: selectedHospital ? selectedHospital.hospital_code : ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Form Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // 1. Mandatory Fields Validation
        const { name, username, email, password, rs_id, department_id, hospital_code } = formData;
        if (!name || !username || !email || !password || !rs_id || !department_id || !hospital_code) {
            setErrorMsg("Semua kolom input wajib diisi!");
            return;
        }

        // 2. Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Format alamat email tidak valid!");
            return;
        }

        // 3. Password Length Validation
        if (password.length < 8) {
            setErrorMsg("Password minimal harus terdiri dari 8 karakter!");
            return;
        }

        try {
            setLoading(true);

            // Construct payload matching Joi validation schema in backend
            const payload = {
                name,
                username,
                email,
                password,
                rs_id: parseInt(rs_id, 10),
                department_id: parseInt(department_id, 10),
                hospital_code
            };

            // Call existing POST /api/v1/user/register endpoint
            // (Authorization header JWT is appended automatically via Axios interceptor in api.js)
            const response = await api.post("/v1/user/register", payload);

            if (response.data && response.data.success) {
                setSuccessMsg(`User "${name}" berhasil didaftarkan ke sistem.`);
                // Reset form fields
                setFormData({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
                    rs_id: "",
                    department_id: "",
                    hospital_code: ""
                });
            } else {
                setErrorMsg(response.data?.message || "Gagal meregistrasi user.");
            }
        } catch (err) {
            console.error("User registration failed:", err);
            const serverMsg = err.response?.data?.message || err.message || "Gagal menghubungi server";
            setErrorMsg("Registrasi Gagal: " + serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-primary mb-1">
                    <i className="bi bi-people-fill me-2"></i>
                    User Management
                </h2>
                <p className="text-muted mb-0">Pendaftaran dan manajemen hak akses akun internal rumah sakit.</p>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Add User Card Form */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-person-plus-fill me-2 text-primary"></i>
                                Tambah User Baru
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {/* Alert Notifications */}
                            {errorMsg && (
                                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div>{errorMsg}</div>
                                </div>
                            )}

                            {successMsg && (
                                <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <div>{successMsg}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 mb-4">
                                    {/* Full Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            placeholder="Masukkan nama lengkap..."
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Username */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            placeholder="Masukkan username..."
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            placeholder="contoh@rs.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Password (Min 8 karakter)</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="Masukkan password..."
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Hospital selection dropdown */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Rumah Sakit</label>
                                        <select
                                            className="form-select"
                                            name="rs_id"
                                            value={formData.rs_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Pilih Rumah Sakit --</option>
                                            {staticHospitals.map(h => (
                                                <option key={h.id} value={h.id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Department selection dropdown */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small">Departemen / Poli</label>
                                        <select
                                            className="form-select"
                                            name="department_id"
                                            value={formData.department_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Pilih Departemen --</option>
                                            {staticDepartments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hospital Code (Auto-filled / Locked read-only) */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold text-dark small">Kode Registrasi Rumah Sakit (BPJS Code)</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            name="hospital_code"
                                            placeholder="Otomatis terisi..."
                                            value={formData.hospital_code}
                                            readOnly
                                            required
                                        />
                                        <small className="text-muted d-block mt-1">Kode ini terisi otomatis saat Anda memilih instansi Rumah Sakit.</small>
                                    </div>
                                </div>

                                <div className="border-top pt-3 d-flex justify-content-end gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Mendaftarkan...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus-fill me-2"></i>
                                                Daftarkan User Baru
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
