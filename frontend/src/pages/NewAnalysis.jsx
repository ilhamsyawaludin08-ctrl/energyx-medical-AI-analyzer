import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";

export default function NewAnalysis() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patient_name: "",
        patient_id: "",
        age: "",
        gender: "Male",
        service_type: "Rawat Jalan",

        subjective: "",
        objective: "",
        assessment: "",

        blood_pressure: "",
        pulse: "",
        respiratory_rate: "",
        temperature: "",
        spo2: "",
        weight: "",
        height: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Fetch user info from localStorage to populate creator and doctor_code
            let creatorName = "dr. Admin";
            let doctorCode = "DR-001";
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user) {
                        creatorName = user.name || user.username || creatorName;
                        doctorCode = `DR-${user.id || '001'}`;
                    }
                } catch (err) {
                    console.error("Error reading user details:", err);
                }
            }

            // Create backend-compatible payload matching recommendationSchema
            const payload = {
                patient_id: formData.patient_id || `RM-${Date.now().toString().slice(-6)}`,
                encounter_number: `ENC-${Date.now()}`,
                unit: "Poli Umum", // Default medical unit
                patient_name: formData.patient_name || "Pasien Tanpa Nama",
                gender: formData.gender === "Male" ? "Laki-laki" : "Perempuan",
                age: formData.age ? parseInt(formData.age, 10) : 0,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                service_type: formData.service_type || "Rawat Jalan",
                subjective: formData.subjective || "-",
                objectif: formData.objective || "-",
                assesment: formData.assessment || "-",
                creator: creatorName,
                doctor_code: doctorCode,
                condition: {
                    TD: formData.blood_pressure || undefined,
                    N: formData.pulse || undefined,
                    RR: formData.respiratory_rate || undefined,
                    S: formData.temperature || undefined,
                    SPO2: formData.spo2 || undefined,
                    BB: formData.weight || undefined,
                    TB: formData.height || undefined
                }
            };

            // Remove undefined values to clean up payload
            Object.keys(payload.condition).forEach(key => {
                if (payload.condition[key] === undefined || payload.condition[key] === "") {
                    delete payload.condition[key];
                }
            });
            if (Object.keys(payload.condition).length === 0) {
                delete payload.condition;
            }

            const response = await api.post(
                "/v1/recomendation",
                payload
            );

            console.log("AI response:", response.data);

            if (response.data && response.data.status === 200) {
                // Redirect to validation page with the recommendation results and patient data
                navigate("/diagnosis", { 
                    state: { 
                        encounterNumber: payload.encounter_number 
                    } 
                });
            } else {
                alert("AI Analysis Failed: " + (response.data.message || "Unknown error"));
            }

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message || "Terjadi kesalahan";
            alert("AI Analysis Failed: " + errMsg);
        } finally {
            setLoading(false);
        }
    };

    /* ---- Shared inline styles ---- */
    const cardStyle = {
        background: "var(--sc-bg-card, #fff)",
        borderRadius: "var(--sc-radius-lg, 16px)",
        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
        border: "1px solid var(--sc-border, #e2e8f0)",
        overflow: "hidden",
        marginBottom: "1.5rem"
    };

    const sectionHeaderStyle = {
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid var(--sc-border, #e2e8f0)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem"
    };

    const sectionTitleStyle = {
        margin: 0,
        fontWeight: 700,
        color: "var(--sc-text-primary, #1e293b)",
        fontSize: "1.05rem"
    };

    const labelStyle = {
        display: "block",
        fontWeight: 600,
        fontSize: "0.85rem",
        color: "var(--sc-text-primary, #1e293b)",
        marginBottom: "0.4rem"
    };

    const inputStyle = {
        borderRadius: "var(--sc-radius-md, 12px)",
        border: "1.5px solid var(--sc-border, #e2e8f0)",
        padding: "0.6rem 0.9rem",
        fontSize: "0.92rem",
        transition: "border-color 0.2s, box-shadow 0.2s",
        background: "var(--sc-bg, #f8fafc)",
        width: "100%",
        height: "44px"
    };

    const textareaStyle = {
        ...inputStyle,
        height: "auto",
        minHeight: "100px",
        resize: "vertical"
    };

    const iconBadgeStyle = (color) => ({
        width: "32px",
        height: "32px",
        borderRadius: "var(--sc-radius-sm, 8px)",
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });

    return (
        <div className="sc-animate-in">
            {/* Page Header */}
            <div className="sc-page-header sc-stagger-1" style={{
                marginBottom: "2rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--sc-border, #e2e8f0)"
            }}>
                <h2 style={{
                    fontWeight: 800,
                    color: "var(--sc-text-primary, #1e293b)",
                    fontSize: "1.65rem",
                    marginBottom: "0.25rem",
                    letterSpacing: "-0.02em"
                }}>
                    <i className="bi bi-cpu me-2" style={{ color: "var(--sc-primary, #3b82f6)" }}></i>
                    New Analysis
                </h2>
                <p style={{
                    color: "var(--sc-text-secondary, #64748b)",
                    marginBottom: 0,
                    fontSize: "0.92rem"
                }}>
                    Input data pasien untuk mendapatkan rekomendasi AI.
                </p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Card 1: Data Pasien */}
                <div className="sc-stagger-2" style={cardStyle}>
                    <div className="sc-section-header" style={sectionHeaderStyle}>
                        <div style={iconBadgeStyle("var(--sc-primary, #3b82f6)")}>
                            <i className="bi bi-person-vcard" style={{ color: "var(--sc-primary, #3b82f6)", fontSize: "1rem" }}></i>
                        </div>
                        <h5 style={sectionTitleStyle}>Data Pasien</h5>
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label style={labelStyle}>Patient Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="patient_name"
                                    value={formData.patient_name}
                                    onChange={handleChange}
                                    placeholder="Nama Pasien"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-6">
                                <label style={labelStyle}>Patient ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    placeholder="Nomor RM"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-3">
                                <label style={labelStyle}>Age</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="Usia"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-3">
                                <label style={labelStyle}>Gender</label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label style={labelStyle}>Service Type</label>
                                <select
                                    className="form-select"
                                    name="service_type"
                                    value={formData.service_type}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="Rawat Jalan">Rawat Jalan</option>
                                    <option value="Rawat Inap">Rawat Inap</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: SOAP Assessment */}
                <div className="sc-stagger-3" style={cardStyle}>
                    <div className="sc-section-header" style={sectionHeaderStyle}>
                        <div style={iconBadgeStyle("var(--sc-info, #06b6d4)")}>
                            <i className="bi bi-journal-medical" style={{ color: "var(--sc-info, #06b6d4)", fontSize: "1rem" }}></i>
                        </div>
                        <h5 style={sectionTitleStyle}>SOAP Assessment</h5>
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Subjective</label>
                            <textarea
                                rows="4"
                                className="form-control"
                                name="subjective"
                                value={formData.subjective}
                                onChange={handleChange}
                                placeholder="Keluhan pasien..."
                                style={textareaStyle}
                            />
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Objective</label>
                            <textarea
                                rows="3"
                                className="form-control"
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                                placeholder="Hasil pemeriksaan..."
                                style={textareaStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Assessment</label>
                            <textarea
                                rows="3"
                                className="form-control"
                                name="assessment"
                                value={formData.assessment}
                                onChange={handleChange}
                                placeholder="Diagnosis sementara..."
                                style={textareaStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Card 3: Tanda Vital */}
                <div className="sc-stagger-4" style={cardStyle}>
                    <div className="sc-section-header" style={sectionHeaderStyle}>
                        <div style={iconBadgeStyle("var(--sc-success, #10b981)")}>
                            <i className="bi bi-heart-pulse" style={{ color: "var(--sc-success, #10b981)", fontSize: "1rem" }}></i>
                        </div>
                        <h5 style={sectionTitleStyle}>Tanda Vital</h5>
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                        <div className="row g-3">
                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-activity me-1" style={{ color: "var(--sc-danger, #ef4444)", fontSize: "0.85rem" }}></i>
                                    TD (mmHg)
                                </label>
                                <input
                                    className="form-control"
                                    name="blood_pressure"
                                    value={formData.blood_pressure}
                                    onChange={handleChange}
                                    placeholder="120/80"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-heart me-1" style={{ color: "var(--sc-danger, #ef4444)", fontSize: "0.85rem" }}></i>
                                    Nadi (bpm)
                                </label>
                                <input
                                    className="form-control"
                                    name="pulse"
                                    value={formData.pulse}
                                    onChange={handleChange}
                                    placeholder="80"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-lungs me-1" style={{ color: "var(--sc-info, #06b6d4)", fontSize: "0.85rem" }}></i>
                                    RR (x/min)
                                </label>
                                <input
                                    className="form-control"
                                    name="respiratory_rate"
                                    value={formData.respiratory_rate}
                                    onChange={handleChange}
                                    placeholder="20"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-thermometer-half me-1" style={{ color: "var(--sc-warning, #f59e0b)", fontSize: "0.85rem" }}></i>
                                    Suhu (°C)
                                </label>
                                <input
                                    className="form-control"
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    placeholder="36.8"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-droplet me-1" style={{ color: "var(--sc-primary, #3b82f6)", fontSize: "0.85rem" }}></i>
                                    SpO₂ (%)
                                </label>
                                <input
                                    className="form-control"
                                    name="spo2"
                                    value={formData.spo2}
                                    onChange={handleChange}
                                    placeholder="98%"
                                    style={inputStyle}
                                />
                            </div>

                            <div className="col-md-4 col-6">
                                <label style={labelStyle}>
                                    <i className="bi bi-speedometer me-1" style={{ color: "var(--sc-success, #10b981)", fontSize: "0.85rem" }}></i>
                                    Berat (Kg)
                                </label>
                                <input
                                    className="form-control"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="60 Kg"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="sc-stagger-5" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: "0.5rem",
                    paddingBottom: "2rem"
                }}>
                    <button
                        type="submit"
                        className="btn btn-lg sc-hover-lift"
                        disabled={loading}
                        style={{
                            background: "var(--sc-primary-gradient, linear-gradient(135deg, #3b82f6, #6366f1))",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "1rem",
                            borderRadius: "var(--sc-radius-md, 12px)",
                            padding: "0.75rem 2.5rem",
                            border: "none",
                            boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            letterSpacing: "0.02em",
                            minWidth: "220px"
                        }}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>

                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cpu me-2"></i>

                                Analyze with AI
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}