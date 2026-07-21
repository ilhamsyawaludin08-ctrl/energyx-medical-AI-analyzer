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
    const [showPassword, setShowPassword] = useState(false);

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

    const inputStyle = {
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-md)',
        padding: '0.65rem 0.9rem',
        fontSize: '0.875rem',
        color: 'var(--sc-text-primary)',
        background: 'var(--sc-bg)',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    };

    const labelStyle = {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'var(--sc-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '0.4rem',
        display: 'block'
    };

    return (
        <div className="sc-animate-in" style={{ padding: 0, minHeight: '100vh' }}>
            {/* Page Header */}
            <div className="sc-page-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--sc-text-primary)',
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                    }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--sc-radius-lg)',
                            background: 'var(--sc-primary-gradient)',
                            color: '#fff',
                            fontSize: '1.15rem'
                        }}>
                            <i className="bi bi-people-fill"></i>
                        </span>
                        User Management
                    </h2>
                    <p style={{
                        color: 'var(--sc-text-muted)',
                        margin: 0,
                        fontSize: '0.9rem',
                        paddingLeft: '3.25rem'
                    }}>
                        Pendaftaran dan manajemen hak akses akun internal rumah sakit.
                    </p>
                </div>
            </div>

            {/* Centered Form Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="sc-animate-in sc-stagger-1 sc-card-accent-primary" style={{
                    width: '100%',
                    maxWidth: '800px',
                    background: 'var(--sc-bg-card)',
                    borderRadius: 'var(--sc-radius-xl)',
                    border: '1px solid var(--sc-border)',
                    boxShadow: 'var(--sc-shadow-md)',
                    overflow: 'hidden'
                }}>
                    {/* Card Header */}
                    <div style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: '1px solid var(--sc-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--sc-radius-md)',
                            background: 'rgba(var(--sc-primary-rgb, 99,102,241), 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--sc-primary)',
                            fontSize: '1rem'
                        }}>
                            <i className="bi bi-person-plus-fill"></i>
                        </div>
                        <h5 style={{
                            margin: 0,
                            fontWeight: '700',
                            fontSize: '1.05rem',
                            color: 'var(--sc-text-primary)'
                        }}>
                            Tambah User Baru
                        </h5>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.75rem' }}>
                        {/* Alert Messages */}
                        {errorMsg && (
                            <div className="sc-animate-in" style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: 'var(--sc-radius-md)',
                                padding: '0.875rem 1rem',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                color: 'var(--sc-danger)',
                                fontSize: '0.875rem'
                            }}>
                                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1rem' }}></i>
                                <div style={{ fontWeight: '500' }}>{errorMsg}</div>
                            </div>
                        )}

                        {successMsg && (
                            <div className="sc-animate-in" style={{
                                background: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.25)',
                                borderRadius: 'var(--sc-radius-md)',
                                padding: '0.875rem 1rem',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                color: 'var(--sc-success)',
                                fontSize: '0.875rem'
                            }}>
                                <i className="bi bi-check-circle-fill" style={{ fontSize: '1rem' }}></i>
                                <div style={{ fontWeight: '500' }}>{successMsg}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1.25rem',
                                marginBottom: '1.5rem'
                            }}>
                                {/* Full Name */}
                                <div>
                                    <label style={labelStyle}>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Masukkan nama lengkap..."
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>

                                {/* Username */}
                                <div>
                                    <label style={labelStyle}>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Masukkan username..."
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="contoh@rs.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>

                                {/* Password with show/hide toggle */}
                                <div>
                                    <label style={labelStyle}>Password (Min 8 karakter)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Masukkan password..."
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            style={{ ...inputStyle, paddingRight: '2.75rem' }}
                                            onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '0.5rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--sc-text-muted)',
                                                padding: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Hospital selection dropdown */}
                                <div>
                                    <label style={labelStyle}>Rumah Sakit</label>
                                    <select
                                        name="rs_id"
                                        value={formData.rs_id}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <option value="">-- Pilih Rumah Sakit --</option>
                                        {staticHospitals.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department selection dropdown */}
                                <div>
                                    <label style={labelStyle}>Departemen / Poli</label>
                                    <select
                                        name="department_id"
                                        value={formData.department_id}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--sc-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--sc-primary-rgb,99,102,241),0.1)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--sc-border)'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <option value="">-- Pilih Departemen --</option>
                                        {staticDepartments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Hospital Code (Auto-filled / Locked read-only) - Full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Kode Registrasi Rumah Sakit (BPJS Code)</label>
                                    <input
                                        type="text"
                                        name="hospital_code"
                                        placeholder="Otomatis terisi..."
                                        value={formData.hospital_code}
                                        readOnly
                                        required
                                        style={{
                                            ...inputStyle,
                                            background: 'var(--sc-bg)',
                                            cursor: 'not-allowed',
                                            opacity: 0.8
                                        }}
                                    />
                                    <small style={{
                                        color: 'var(--sc-text-muted)',
                                        fontSize: '0.75rem',
                                        marginTop: '0.35rem',
                                        display: 'block'
                                    }}>
                                        Kode ini terisi otomatis saat Anda memilih instansi Rumah Sakit.
                                    </small>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div style={{
                                borderTop: '1px solid var(--sc-border)',
                                paddingTop: '1.25rem',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="submit"
                                    className="sc-hover-lift"
                                    disabled={loading}
                                    style={{
                                        background: loading ? 'var(--sc-text-muted)' : 'var(--sc-primary-gradient)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 'var(--sc-radius-md)',
                                        padding: '0.7rem 2rem',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: 'var(--sc-shadow-sm)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" style={{ width: '1rem', height: '1rem' }}></span>
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-plus-fill"></i>
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
    );
}
