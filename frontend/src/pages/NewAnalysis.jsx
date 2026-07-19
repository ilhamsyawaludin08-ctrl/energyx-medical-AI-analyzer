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
                        result: response.data.data, 
                        patientData: payload 
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

    return (
        <>
            <div className="mb-4">
                <h2 className="fw-bold">
                    New Analysis
                </h2>

                <p className="text-muted">
                    Input data pasien untuk mendapatkan rekomendasi AI.
                </p>
            </div>

            <div className="card border-0 shadow-sm">

                <form onSubmit={handleSubmit}>

                <div className="card-header bg-white">
                    <h5 className="mb-0">
                        Patient Information
                    </h5>
                </div>

                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">
                                Patient Name
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="patient_name"
                                value={formData.patient_name}
                                onChange={handleChange}
                                placeholder="Nama Pasien"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Patient ID
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="patient_id"
                                value={formData.patient_id}
                                onChange={handleChange}
                                placeholder="Nomor RM"
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">
                                Age
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Usia"
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">
                                Gender
                            </label>

                            <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Service Type
                            </label>

                            <select className="form-select" name="service_type" value={formData.service_type} onChange={handleChange}>

                                <option value="Rawat Jalan">
                                    Rawat Jalan
                                </option>

                                <option value="Rawat Inap">
                                    Rawat Inap
                                </option>

                            </select>
                        </div>

                    </div>

                

                    <hr className="my-4" />

                        <h5 className="mb-3">
                            SOAP Assessment
                        </h5>

                        <div className="mb-3">

                            <label className="form-label">
                                Subjective
                            </label>

                            <textarea
                                rows="4"
                                className="form-control"
                                name="subjective"
                                value={formData.subjective}
                                onChange={handleChange}
                                placeholder="Keluhan pasien..."
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Objective
                            </label>

                            <textarea
                                rows="3"
                                className="form-control"
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                                placeholder="Hasil pemeriksaan..."
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Assessment
                            </label>

                            <textarea
                                rows="3"
                                className="form-control"
                                name="assessment"
                                value={formData.assessment}
                                onChange={handleChange}
                                placeholder="Diagnosis sementara..."
                            />

                        </div>
                    
                </div>          
                <hr className="my-4" />

                    <h5 className="mb-3">
                        Vital Sign
                    </h5>

                    <div className="row g-3">

                        <div className="col-md-2">
                            <label className="form-label">
                                TD
                            </label>

                            <input
                                className="form-control"
                                name="blood_pressure"
                                value={formData.blood_pressure}
                                onChange={handleChange}
                                placeholder="120/80"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Nadi
                            </label>

                            <input
                                className="form-control"
                                name="pulse"
                                value={formData.pulse}
                                onChange={handleChange}
                                placeholder="80"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                RR
                            </label>

                            <input
                                className="form-control"
                                name="respiratory_rate"
                                value={formData.respiratory_rate}
                                onChange={handleChange}
                                placeholder="20"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Suhu
                            </label>

                            <input
                                className="form-control"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                placeholder="36.8"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                SpO₂
                            </label>

                            <input
                                className="form-control"
                                name="spo2"
                                value={formData.spo2}
                                onChange={handleChange}
                                placeholder="98%"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Berat
                            </label>

                            <input
                                className="form-control"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="60 Kg"
                            />
                        </div>

                    </div>


                <div className="mt-4 d-flex justify-content-end">

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
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

        </>
    );
}