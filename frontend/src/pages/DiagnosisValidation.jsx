import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function DiagnosisValidation() {
    const location = useLocation();
    const navigate = useNavigate();

    // Core state
    const [loading, setLoading] = useState(false);
    const [encounters, setEncounters] = useState([]);
    const [selectedEncounterNum, setSelectedEncounterNum] = useState("");
    const [patientInfo, setPatientInfo] = useState(null);
    const [aiRecommendations, setAiRecommendations] = useState(null);

    // Doctor decisions state
    const [selectedPrimaryDiagnosis, setSelectedPrimaryDiagnosis] = useState(null); // { id, disease_name, icd10_code, claim }
    const [selectedSecondaryDiagnoses, setSelectedSecondaryDiagnoses] = useState([]); // array of { id, disease_name, icd10_code, claim }
    const [selectedTreatments, setSelectedTreatments] = useState([]); // array of action objects
    const [completedDocs, setCompletedDocs] = useState({
        has_medical_resume: false,
        has_lab_results: false,
        has_imaging: false,
        has_specialist_consultation: false,
        has_iv_therapy_proof: false,
        has_daily_care_notes: false,
        has_min_5day_inpatient: false,
    });
    const [severityLevel, setSeverityLevel] = useState(1);
    const [notes, setNotes] = useState("");

    // Autocomplete Master Diagnosis Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);
    const [searchTargetType, setSearchTargetType] = useState("primary"); // "primary" or "secondary"
    const dropdownRef = useRef(null);

    // Load initial data
    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResultsDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check if redirected from New Analysis
    useEffect(() => {
        if (location.state && location.state.result && location.state.patientData) {
            const result = location.state.result;
            const patientData = location.state.patientData;
            
            // Format state from redirect
            setPatientInfo({
                patient_id: patientData.patient_id,
                patient_name: patientData.patient_name,
                age: patientData.age,
                gender: patientData.gender,
                weight: patientData.weight,
                service_type: patientData.service_type,
                encounter_number: patientData.encounter_number,
                unit: patientData.unit,
                subjective: patientData.subjective,
                objective: patientData.objective,
                assessment: patientData.assessment
            });

            // Map recommendations
            const aiData = result.ai_analysis_recommendations;
            setAiRecommendations(aiData);
            setSeverityLevel(aiData.severity_level || 1);

            // Set checklist
            setCompletedDocs({
                has_medical_resume: !!aiData.resume_medis,
                has_lab_results: !!aiData.hasil_laboratorium,
                has_imaging: !!aiData.hasil_radiologi,
                has_specialist_consultation: false, // Default false
                has_iv_therapy_proof: false,
                has_daily_care_notes: !!aiData.lembar_observasi,
                has_min_5day_inpatient: false,
            });

            // Attempt to pre-populate primary & secondary diagnoses from master database
            prepopulateDiagnoses(aiData);
        } else if (location.state && location.state.encounterNumber) {
            // Load encounter details from passed encounterNumber
            loadEncounterAnalysis(location.state.encounterNumber);
        } else {
            // Load list of recent encounters for review
            fetchRecentEncounters();
        }
    }, [location.state]);

    // Fetch master diagnosis list
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get(`/diagnosis?diagnosis=${searchQuery}`);
                if (response.data && response.data.status === 'success') {
                    setSearchResults(response.data.data);
                } else if (response.data && response.data.data) {
                    setSearchResults(response.data.data);
                }
            } catch (err) {
                console.error("Failed to search master diagnosis", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchRecentEncounters = async () => {
        try {
            setLoading(true);
            const response = await api.get("/v1/service/encounters?limit=10");
            if (response.data && response.data.data && response.data.data.rows) {
                setEncounters(response.data.data.rows);
            }
        } catch (err) {
            console.error("Failed to load encounters", err);
        } finally {
            setLoading(false);
        }
    };

    const loadEncounterAnalysis = async (encounterNumber) => {
        try {
            setLoading(true);
            const response = await api.get(`/v1/service/encounters/${encounterNumber}`);
            const dataList = response.data?.data;
            if (dataList && dataList.length > 0) {
                const analysis = dataList[0];
                
                setPatientInfo({
                    patient_id: analysis.patient_id,
                    patient_name: analysis.patient_name,
                    age: analysis.age,
                    gender: analysis.gender,
                    weight: analysis.weight,
                    service_type: analysis.service_type,
                    encounter_number: analysis.encounter_number,
                    unit: "Poli Umum",
                    subjective: analysis.subjective,
                    objective: analysis.objective,
                    assessment: analysis.assesment
                });

                // Map database relations into recommendation state
                const severityObj = Array.isArray(analysis.severity) ? analysis.severity[0] : analysis.severity;
                const aiData = {
                    diagnosis_primer: analysis.diagnosis ? analysis.diagnosis.filter(d => d.is_primary) : [],
                    diagnosis_sekunder: analysis.diagnosis ? analysis.diagnosis.filter(d => !d.is_primary) : [],
                    tindakan_medis: analysis.treatment || [],
                    severity_level: severityObj ? severityObj.level : 1,
                    severity_justifikasi: severityObj ? severityObj.justification : "",
                    resume_medis: severityObj?.checklist?.includes("Resume Medis"),
                    hasil_laboratorium: severityObj?.checklist?.includes("Laboratorium"),
                    hasil_radiologi: severityObj?.checklist?.includes("Radiologi"),
                    lembar_observasi: severityObj?.checklist?.includes("Observasi"),
                    jenis_pelayanan: analysis.service_type
                };

                setAiRecommendations(aiData);
                setSeverityLevel(aiData.severity_level || 1);
                
                // Map checklist
                setCompletedDocs({
                    has_medical_resume: !!aiData.resume_medis,
                    has_lab_results: !!aiData.hasil_laboratorium,
                    has_imaging: !!aiData.hasil_radiologi,
                    has_specialist_consultation: false,
                    has_iv_therapy_proof: false,
                    has_daily_care_notes: !!aiData.lembar_observasi,
                    has_min_5day_inpatient: false,
                });

                prepopulateDiagnoses(aiData);
            } else {
                alert("Detail analisis tidak ditemukan untuk encounter ini.");
            }
        } catch (err) {
            console.error("Failed to load encounter details", err);
            alert("Gagal memuat detail analisis.");
        } finally {
            setLoading(false);
        }
    };

    const prepopulateDiagnoses = async (aiData) => {
        // Prepopulate primary diagnosis
        const primaryAi = aiData.diagnosis_primer?.find(d => d.rekomendasi_ai || d.is_ai_recommendation);
        if (primaryAi) {
            const code = primaryAi.kode || primaryAi.code;
            try {
                const response = await api.get(`/diagnosis?diagnosis=${code}`);
                const list = response.data?.data || [];
                const exactMatch = list.find(d => d.icd10_code === code);
                if (exactMatch) {
                    setSelectedPrimaryDiagnosis(exactMatch);
                } else if (list.length > 0) {
                    setSelectedPrimaryDiagnosis(list[0]);
                }
            } catch (err) {
                console.error("Error prepopulating primary diagnosis:", err);
            }
        }

        // Prepopulate secondary diagnoses
        const secondaryAiList = aiData.diagnosis_sekunder || [];
        const mappedSecondaries = [];
        for (const sec of secondaryAiList) {
            const code = sec.kode || sec.code;
            try {
                const response = await api.get(`/diagnosis?diagnosis=${code}`);
                const list = response.data?.data || [];
                const exactMatch = list.find(d => d.icd10_code === code);
                if (exactMatch) {
                    mappedSecondaries.push(exactMatch);
                } else if (list.length > 0) {
                    mappedSecondaries.push(list[0]);
                }
            } catch (err) {
                console.error("Error prepopulating secondary diagnosis:", err);
            }
        }
        setSelectedSecondaryDiagnoses(mappedSecondaries);

        // Prepopulate treatments from AI suggestions
        const actionsAi = aiData.tindakan_medis || [];
        setSelectedTreatments(actionsAi.map(action => ({
            code: action.kode || action.code,
            title: action.nama || action.title,
            category: action.kategori || action.category,
            inacbg: action.inacbg,
            cost: action.cost || 150000, // default estimation cost if not set
            is_selected: true
        })));
    };

    // Autocomplete select helper
    const handleSelectDiagnosis = (diag) => {
        if (searchTargetType === "primary") {
            setSelectedPrimaryDiagnosis(diag);
        } else {
            // Check if already in secondary list
            if (!selectedSecondaryDiagnoses.some(d => d.id === diag.id)) {
                setSelectedSecondaryDiagnoses([...selectedSecondaryDiagnoses, diag]);
            }
        }
        setSearchQuery("");
        setShowResultsDropdown(false);
    };

    const removeSecondaryDiagnosis = (id) => {
        setSelectedSecondaryDiagnoses(selectedSecondaryDiagnoses.filter(d => d.id !== id));
    };

    const toggleTreatment = (code) => {
        setSelectedTreatments(selectedTreatments.map(t => {
            if (t.code === code) {
                return { ...t, is_selected: !t.is_selected };
            }
            return t;
        }));
    };

    // Coherence Check Logic
    const evaluateClinicalCoherence = (diagnosis) => {
        if (!diagnosis || !patientInfo) return { isCoherent: true, warning: "" };

        const subjective = (patientInfo.subjective || "").toLowerCase();
        const objective = (patientInfo.objective || "").toLowerCase();
        const code = (diagnosis.icd10_code || "").toUpperCase();

        // 1. Gastroenteritis / Diarrhea (A09, K59, A08)
        if (code.startsWith("A09") || code.startsWith("K59") || code.startsWith("A08") || code.startsWith("K52")) {
            const keywords = ["diare", "mencret", "cair", "muntah", "mual", "bab", "perut", "dehidrasi", "feces", "tinja"];
            const hasKeyword = keywords.some(kw => subjective.includes(kw) || objective.includes(kw));
            if (!hasKeyword) {
                return {
                    isCoherent: false,
                    warning: `⚠️ Diagnosis ${code} (${diagnosis.disease_name}) kurang didukung bukti SOAP diare/muntah.`
                };
            }
        }

        // 2. TB / Respiratory (A15, A16, J44, J18, J15)
        if (code.startsWith("A15") || code.startsWith("A16") || code.startsWith("J44") || code.startsWith("J18") || code.startsWith("J15") || code.startsWith("J20") || code.startsWith("J0")) {
            const keywords = ["batuk", "sesak", "dada", "dahak", "sputum", "bta", "tbc", "paru", "thorax", "nafas", "ispa", "pilek"];
            const hasKeyword = keywords.some(kw => subjective.includes(kw) || objective.includes(kw));
            if (!hasKeyword) {
                return {
                    isCoherent: false,
                    warning: `⚠️ Diagnosis ${code} (${diagnosis.disease_name}) kurang didukung bukti SOAP gejala pernapasan (batuk/sesak).`
                };
            }
        }

        // 3. Hypertension / Cardiovascular (I10, I11, I15, I50)
        if (code.startsWith("I10") || code.startsWith("I11") || code.startsWith("I15") || code.startsWith("I50") || code.startsWith("I2")) {
            const keywords = ["hipertensi", "darah tinggi", "tensi", "pusing", "nyeri dada", "jantung", "ekg", "leher kaku"];
            const hasKeyword = keywords.some(kw => subjective.includes(kw) || objective.includes(kw));
            if (!hasKeyword) {
                return {
                    isCoherent: false,
                    warning: `⚠️ Diagnosis ${code} (${diagnosis.disease_name}) kurang didukung bukti SOAP hipertensi/gangguan jantung.`
                };
            }
        }

        return { isCoherent: true, warning: "" };
    };

    // Calculate dynamic risk score and checklist validation
    const getValidationRules = () => {
        let score = 100;
        const errors = [];
        const warnings = [];

        // 1. Primary Diagnosis validation
        if (!selectedPrimaryDiagnosis) {
            errors.push("Diagnosis primer wajib dipilih dari database master.");
            score -= 30;
        } else {
            // Check coherence of primary diagnosis
            const coherence = evaluateClinicalCoherence(selectedPrimaryDiagnosis);
            if (!coherence.isCoherent) {
                warnings.push(coherence.warning);
                score -= 20;
            }

            // Check if primary diagnosis matches AI recommendations
            const aiPrimaryCodes = aiRecommendations?.diagnosis_primer?.map(d => d.kode || d.code) || [];
            if (aiPrimaryCodes.length > 0 && !aiPrimaryCodes.includes(selectedPrimaryDiagnosis.icd10_code)) {
                warnings.push(`⚠️ Diagnosis utama terpilih (${selectedPrimaryDiagnosis.icd10_code}) tidak tercantum dalam rekomendasi AI.`);
                score -= 15;
            }
        }

        // 2. Secondary Diagnoses checks
        selectedSecondaryDiagnoses.forEach(diag => {
            const coherence = evaluateClinicalCoherence(diag);
            if (!coherence.isCoherent) {
                warnings.push(coherence.warning);
                score -= 10;
            }

            // Check chapter relationship consistency (Primary & Secondary Coherence)
            if (selectedPrimaryDiagnosis) {
                const primaryChapter = selectedPrimaryDiagnosis.icd10_code.charAt(0);
                const secondaryChapter = diag.icd10_code.charAt(0);
                // Exclude common supportive comorbidities (e.g. Infeksi A + Dehidrasi E)
                const allowedDiffChapters = { 'A': ['E', 'R'], 'K': ['E', 'R'], 'I': ['E', 'R'] };
                if (primaryChapter !== secondaryChapter && (!allowedDiffChapters[primaryChapter] || !allowedDiffChapters[primaryChapter].includes(secondaryChapter))) {
                    warnings.push(`⚠️ Diagnosis sekunder ${diag.icd10_code} berasal dari kategori organ berbeda dengan diagnosis utama.`);
                    score -= 10;
                }
            }
        });

        // 3. Treatment Linkage check
        selectedTreatments.filter(t => t.is_selected).forEach(t => {
            if (selectedPrimaryDiagnosis && t.inacbg) {
                const primaryChapter = selectedPrimaryDiagnosis.icd10_code.charAt(0);
                const treatmentInacbgLetter = t.inacbg.charAt(0);
                if (primaryChapter !== treatmentInacbgLetter && treatmentInacbgLetter !== "Z" && treatmentInacbgLetter !== "U") {
                    warnings.push(`⚠️ Kode INACBG tindakan ${t.code} (${t.inacbg}) tidak sejalan dengan kelompok diagnosis primer (${primaryChapter}).`);
                    score -= 15;
                }
            }
        });

        // 4. Document Checklist validation by Severity Level
        const level = parseInt(severityLevel, 10);
        
        // Mandatory documents mapping
        const docRequirements = {
            1: {
                has_medical_resume: { required: true, label: "Resume Medis" }
            },
            2: {
                has_medical_resume: { required: true, label: "Resume Medis" },
                has_lab_results: { required: true, label: "Hasil Laboratorium" },
                has_specialist_consultation: { required: true, label: "Konsultasi Dokter Spesialis" }
            },
            3: {
                has_medical_resume: { required: true, label: "Resume Medis" },
                has_lab_results: { required: true, label: "Hasil Laboratorium" },
                has_imaging: { required: true, label: "Hasil Radiologi / Imaging" },
                has_specialist_consultation: { required: true, label: "Konsultasi Dokter Spesialis" },
                has_daily_care_notes: { required: true, label: "Catatan Harian Perawatan" }
            }
        };

        const requirements = docRequirements[level] || docRequirements[1];
        
        Object.keys(requirements).forEach(docKey => {
            if (requirements[docKey].required && !completedDocs[docKey]) {
                errors.push(`Dokumen wajib belum lengkap: ${requirements[docKey].label} (Diharuskan untuk Severity Level ${level}).`);
                score -= 10;
            }
        });

        // 5. Severity mismatch check
        if (aiRecommendations && aiRecommendations.severity_level !== level) {
            warnings.push(`⚠️ Level keparahan yang dipilih (Level ${level}) berbeda dengan rekomendasi AI (Level ${aiRecommendations.severity_level}).`);
            score -= 15;
        }

        // Final score capping
        score = Math.max(0, score);
        
        let riskLevel = "low";
        let riskBadgeColor = "success";
        if (score < 60) {
            riskLevel = "high";
            riskBadgeColor = "danger";
        } else if (score < 85) {
            riskLevel = "medium";
            riskBadgeColor = "warning";
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            riskScore: score,
            riskLevel,
            riskBadgeColor
        };
    };

    const validation = getValidationRules();

    // Financial Calculation Logic
    const calculateFinancials = () => {
        // 1. Coverage BPJS (from Primary Diagnosis claim)
        const coverage = selectedPrimaryDiagnosis ? parseFloat(selectedPrimaryDiagnosis.claim || 0) : 0;

        // 2. Base Hospital Cost depending on severity level
        const baseCostMapping = { 1: 3000000, 2: 2000000, 3: 1000000 };
        const baseCost = baseCostMapping[parseInt(severityLevel, 10)] || 1000000;

        // 3. Treatment costs
        const treatmentCost = selectedTreatments
            .filter(t => t.is_selected)
            .reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);

        const totalCost = baseCost + treatmentCost;
        const profit = coverage - totalCost;

        return {
            coverage,
            totalCost,
            profit,
            isProfitable: profit >= 0
        };
    };

    const financials = calculateFinancials();

    // Submit Transaction Log
    const handleSubmitClaim = async () => {
        if (!validation.isValid) {
            alert("Tidak dapat mengirim klaim. Selesaikan semua error validasi wajib terlebih dahulu.");
            return;
        }

        try {
            setLoading(true);

            // Construct payload matching createTransactionSchema
            const payload = {
                patient_name: patientInfo.patient_name,
                primary_diagnosis: selectedPrimaryDiagnosis.id,
                secondary_diagnosis: selectedSecondaryDiagnoses.map(d => d.id),
                document_checklist: {
                    has_medical_resume: completedDocs.has_medical_resume,
                    has_lab_results: completedDocs.has_lab_results,
                    has_imaging: completedDocs.has_imaging,
                    has_specialist_consultation: completedDocs.has_specialist_consultation,
                    has_iv_therapy_proof: completedDocs.has_iv_therapy_proof,
                    has_daily_care_notes: completedDocs.has_daily_care_notes,
                    has_min_5day_inpatient: completedDocs.has_min_5day_inpatient,
                    severity_level: parseInt(severityLevel, 10)
                },
                notes: notes || `Klaim divalidasi oleh dokter dengan Risk Score: ${validation.riskScore}%`
            };

            const response = await api.post("/transactions", payload);
            
            if (response.data && response.data.success) {
                alert("Claim Transaction successfully saved & synced with BPJS Gate!");
                navigate("/transactions");
            } else {
                alert("Failed to submit claim: " + (response.data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Submission failed:", err);
            const errMsg = err.response?.data?.message || err.message || "Gagal menghubungi server";
            alert("Error submitting claim: " + errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Render Encounter Selector Panel if no data loaded
    if (!patientInfo) {
        return (
            <div className="container-fluid">
                <div className="mb-4">
                    <h2 className="fw-bold text-primary">
                        <i className="bi bi-clipboard2-pulse me-2"></i>
                        Diagnosis Validation
                    </h2>
                    <p className="text-muted">
                        Pilih data kunjungan pasien (Encounter) yang sudah di-analisis oleh AI untuk divalidasi kodenya.
                    </p>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">Recent Encounter AI Analyses</h5>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Memuat data kunjungan...</p>
                            </div>
                        ) : encounters.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-folder-x fs-1 text-muted"></i>
                                <p className="mt-3 text-muted">Belum ada riwayat analisis AI. Silakan masuk ke menu <strong>New Analysis</strong> terlebih dahulu.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Pasien</th>
                                            <th>No. RM</th>
                                            <th>Encounter No.</th>
                                            <th>Unit/Layanan</th>
                                            <th>Tanggal</th>
                                            <th className="text-end">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {encounters.map((enc) => (
                                            <tr key={enc.id}>
                                                <td>
                                                    <div className="fw-bold">{enc.patient_name}</div>
                                                    <small className="text-muted">{enc.gender}, {enc.age} Th</small>
                                                </td>
                                                <td><code>{enc.patient_id}</code></td>
                                                <td><code>{enc.encounter_number}</code></td>
                                                <td>
                                                    <span className="badge bg-light text-dark me-2">{enc.service_type}</span>
                                                </td>
                                                <td>{new Date(enc.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => loadEncounterAnalysis(enc.encounter_number)}
                                                    >
                                                        <i className="bi bi-check2-square me-1"></i>
                                                        Pilih & Validasi
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            {/* Top Navigation & Info Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => { setPatientInfo(null); setAiRecommendations(null); fetchRecentEncounters(); }}>
                        <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar
                    </button>
                    <h2 className="fw-bold mb-0 text-primary">
                        🏥 Validasi Klaim: {patientInfo.patient_name}
                    </h2>
                    <small className="text-muted">
                        No. Encounter: <code>{patientInfo.encounter_number}</code> | RM: <code>{patientInfo.patient_id}</code> | Unit: {patientInfo.unit}
                    </small>
                </div>
                <div className="d-flex gap-2">
                    <span className="badge bg-info text-white p-2 fs-6">
                        <i className="bi bi-heart-pulse me-1"></i> {patientInfo.service_type}
                    </span>
                    <span className="badge bg-secondary p-2 fs-6">
                        Severity AI: Level {aiRecommendations?.severity_level}
                    </span>
                </div>
            </div>

            {/* SOAP Context Summary Accordion */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body py-2 px-3">
                    <div className="row text-dark">
                        <div className="col-md-4 border-end">
                            <strong>Subjective (Keluhan):</strong>
                            <p className="mb-0 text-muted small">{patientInfo.subjective}</p>
                        </div>
                        <div className="col-md-4 border-end">
                            <strong>Objective (Pemeriksaan Fisik/Vital):</strong>
                            <p className="mb-0 text-muted small">{patientInfo.objective}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Assessment (Diagnosis Awal):</strong>
                            <p className="mb-0 text-muted small">{patientInfo.assessment}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Validation Layout: Two Columns */}
            <div className="row g-4">
                
                {/* LEFT COLUMN: AI Recommendations References */}
                <div className="col-lg-6">
                    
                    {/* AI Diagnosis suggestions */}
                    <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: "5px solid #0891b2" }}>
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-info">
                                <i className="bi bi-cpu me-2"></i>
                                Rekomendasi Diagnosis AI
                            </h5>
                        </div>
                        <div className="card-body">
                            <h6 className="fw-bold text-secondary border-bottom pb-2">Diagnosis Primer</h6>
                            {aiRecommendations?.diagnosis_primer?.map((diag, idx) => (
                                <div key={idx} className="p-3 mb-3 bg-light rounded border-start border-danger border-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="fw-bold text-dark mb-1">
                                            <code>{diag.kode || diag.code}</code> - {diag.nama || diag.title}
                                        </h6>
                                        <span className="badge bg-danger">Confidence: {diag.confidence}%</span>
                                    </div>
                                    <p className="small text-muted mb-0 mt-2">
                                        <strong>Alasan:</strong> {diag.alasan || diag.reason}
                                    </p>
                                    <small className="text-secondary">
                                        INACBG Group: <strong>{diag.inacbg || "A"}</strong>
                                    </small>
                                </div>
                            ))}

                            <h6 className="fw-bold text-secondary border-bottom pb-2 mt-4">Diagnosis Sekunder</h6>
                            {aiRecommendations?.diagnosis_sekunder?.length === 0 ? (
                                <p className="text-muted small">Tidak ada saran diagnosis sekunder.</p>
                            ) : (
                                aiRecommendations?.diagnosis_sekunder?.map((diag, idx) => (
                                    <div key={idx} className="p-2 mb-2 bg-light rounded border-start border-info border-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-semibold text-dark small">
                                                <code>{diag.kode || diag.code}</code> - {diag.nama || diag.title}
                                            </span>
                                            <span className="badge bg-info text-white small">Conf: {diag.confidence}%</span>
                                        </div>
                                        <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.8rem" }}>
                                            <strong>Alasan:</strong> {diag.alasan || diag.reason}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AI Medical Treatment suggestions */}
                    <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: "5px solid #0891b2" }}>
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-info">
                                <i className="bi bi-activity me-2"></i>
                                Rekomendasi Tindakan AI (ICD-9-CM)
                            </h5>
                        </div>
                        <div className="card-body">
                            {aiRecommendations?.tindakan_medis?.length === 0 ? (
                                <p className="text-muted">Tidak ada rekomendasi tindakan medis.</p>
                            ) : (
                                aiRecommendations?.tindakan_medis?.map((action, idx) => (
                                    <div key={idx} className="p-3 mb-2 bg-light rounded border">
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold text-dark">
                                                <code>{action.kode || action.code}</code> - {action.nama || action.title}
                                            </span>
                                            <span className="badge bg-light text-primary">Rec: {action.confidence || 90}%</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: "0.8rem" }}>
                                            <span className="text-muted">Kategori: <strong>{action.kategori || action.category}</strong></span>
                                            <span className="text-success fw-bold">Linkage INACBG: {action.inacbg}</span>
                                        </div>
                                        <p className="small text-muted mt-2 mb-0"><strong>Justifikasi:</strong> {action.alasan || action.reason}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Doctor Selections & Interactive Rules Engine */}
                <div className="col-lg-6">
                    
                    {/* Doctor selection input panel */}
                    <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: "5px solid #1e40af" }}>
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-file-earmark-medical me-2"></i>
                                Diagnosis Final (Dokter Selection)
                            </h5>
                        </div>
                        <div className="card-body">
                            
                            {/* Search autocomplete container */}
                            <div className="mb-4 position-relative" ref={dropdownRef}>
                                <label className="form-label fw-bold">
                                    Cari Master Diagnosis ICD-10
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ketik kode ICD atau nama penyakit (min 2 huruf)..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setShowResultsDropdown(true); }}
                                        onFocus={() => setShowResultsDropdown(true)}
                                    />
                                    <select
                                        className="form-select border-start-0"
                                        style={{ maxWidth: "150px" }}
                                        value={searchTargetType}
                                        onChange={(e) => setSearchTargetType(e.target.value)}
                                    >
                                        <option value="primary">Primer</option>
                                        <option value="secondary">Sekunder</option>
                                    </select>
                                </div>

                                {showResultsDropdown && searchResults.length > 0 && (
                                    <ul className="list-group position-absolute w-100 mt-1 shadow-lg z-3 overflow-y-auto" style={{ maxHeight: "250px" }}>
                                        {searchResults.map((diag) => (
                                            <li
                                                key={diag.id}
                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleSelectDiagnosis(diag)}
                                            >
                                                <div>
                                                    <span className="badge bg-secondary me-2">{diag.icd10_code}</span>
                                                    <strong>{diag.disease_name}</strong>
                                                    <div className="small text-muted">{diag.doctor_diagnosis}</div>
                                                </div>
                                                <span className="text-success fw-bold small">Rp {parseFloat(diag.claim).toLocaleString('id-ID')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Display chosen primary diagnosis */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-2">Diagnosis Primer Terpilled (Wajib 1)</h6>
                                {selectedPrimaryDiagnosis ? (
                                    <div className="p-3 bg-white border border-success rounded d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="badge bg-success me-2">{selectedPrimaryDiagnosis.icd10_code}</span>
                                            <strong>{selectedPrimaryDiagnosis.disease_name}</strong>
                                            <div className="small text-muted">{selectedPrimaryDiagnosis.doctor_diagnosis}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-success fw-bold">Rp {parseFloat(selectedPrimaryDiagnosis.claim).toLocaleString('id-ID')}</div>
                                            <button className="btn btn-sm btn-link text-danger p-0 mt-1" onClick={() => setSelectedPrimaryDiagnosis(null)}>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-danger mb-0 py-2">
                                        <i className="bi bi-exclamation-octagon me-2"></i>
                                        Belum ada diagnosis primer terpilih. Cari di kolom pencarian di atas.
                                    </div>
                                )}
                            </div>

                            {/* Display chosen secondary diagnoses */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-2">Diagnosis Sekunder Terpilih (Maksimal 2)</h6>
                                {selectedSecondaryDiagnoses.length === 0 ? (
                                    <p className="text-muted small mb-0">Belum ada diagnosis sekunder terpilih.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {selectedSecondaryDiagnoses.map((diag) => (
                                            <div key={diag.id} className="p-2 bg-white border rounded d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="badge bg-secondary me-2">{diag.icd10_code}</span>
                                                    <span className="fw-semibold text-dark small">{diag.disease_name}</span>
                                                </div>
                                                <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" onClick={() => removeSecondaryDiagnosis(diag.id)}>
                                                    <i className="bi bi-x-circle fs-6"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Treatment Selection final */}
                            <div className="mb-2">
                                <h6 className="fw-bold text-dark mb-2">Tindakan Medis terpilih (ICD-9-CM)</h6>
                                <div className="d-flex flex-column gap-2">
                                    {selectedTreatments.map((t) => (
                                        <div key={t.code} className={`p-2 border rounded d-flex justify-content-between align-items-center ${t.is_selected ? 'bg-light border-primary' : 'bg-white opacity-50'}`}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`doc-t-${t.code}`}
                                                    checked={t.is_selected}
                                                    onChange={() => toggleTreatment(t.code)}
                                                />
                                                <label className="form-check-label text-dark small" htmlFor={`doc-t-${t.code}`}>
                                                    <strong>[{t.code}]</strong> {t.title}
                                                </label>
                                            </div>
                                            <span className="text-muted small">Rp {parseFloat(t.cost).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Checklist Panel */}
                    <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: "5px solid #d97706" }}>
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-warning">
                                <i className="bi bi-file-earmark-check me-2"></i>
                                BPJS Claims Document Checklist
                            </h5>
                            <div className="d-flex align-items-center">
                                <label className="me-2 fw-bold text-dark mb-0 small">Severity Level:</label>
                                <select className="form-select form-select-sm" style={{ width: "100px" }} value={severityLevel} onChange={(e) => setSeverityLevel(parseInt(e.target.value, 10))}>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small">
                                Dokumen wajib ditentukan berdasarkan <strong>Severity Level {severityLevel}</strong>. Kelalaian melengkapi berkas ini akan menyebabkan klaim tertunda atau ditolak.
                            </p>
                            
                            <div className="list-group list-group-flush border rounded p-2">
                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-resume"
                                        checked={completedDocs.has_medical_resume}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_medical_resume: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-resume">
                                        Resume Medis Lengkap <span className="badge bg-danger ms-2">Wajib Lvl 1,2,3</span>
                                    </label>
                                </div>

                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-lab"
                                        checked={completedDocs.has_lab_results}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_lab_results: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-lab">
                                        Hasil Pemeriksaan Lab <span className={`badge ms-2 ${severityLevel >= 2 ? 'bg-danger' : 'bg-secondary'}`}>{severityLevel >= 2 ? 'Wajib Lvl 2,3' : 'Disarankan'}</span>
                                    </label>
                                </div>

                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-imaging"
                                        checked={completedDocs.has_imaging}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_imaging: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-imaging">
                                        Hasil Radiologi / Imaging <span className={`badge ms-2 ${severityLevel >= 3 ? 'bg-danger' : severityLevel === 2 ? 'bg-warning' : 'bg-secondary'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : severityLevel === 2 ? 'Disarankan' : 'Opsional'}</span>
                                    </label>
                                </div>

                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-specialist"
                                        checked={completedDocs.has_specialist_consultation}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_specialist_consultation: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-specialist">
                                        Konsultasi Dokter Spesialis <span className={`badge ms-2 ${severityLevel >= 2 ? 'bg-danger' : 'bg-secondary'}`}>{severityLevel >= 2 ? 'Wajib Lvl 2,3' : 'Opsional'}</span>
                                    </label>
                                </div>

                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-iv"
                                        checked={completedDocs.has_iv_therapy_proof}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_iv_therapy_proof: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-iv">
                                        Bukti Pemberian Terapi IV (Insulin, Infus, dll) <span className={`badge ms-2 ${severityLevel >= 3 ? 'bg-danger' : 'bg-secondary'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : 'Opsional'}</span>
                                    </label>
                                </div>

                                <div className="form-check py-2 border-bottom">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-notes"
                                        checked={completedDocs.has_daily_care_notes}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_daily_care_notes: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-notes">
                                        Catatan Harian Perawatan (Asuhan Keperawatan) <span className={`badge ms-2 ${severityLevel >= 3 ? 'bg-danger' : severityLevel === 2 ? 'bg-warning' : 'bg-secondary'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : severityLevel === 2 ? 'Disarankan' : 'Opsional'}</span>
                                    </label>
                                </div>

                                <div className="form-check py-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="doc-min5day"
                                        checked={completedDocs.has_min_5day_inpatient}
                                        onChange={(e) => setCompletedDocs({ ...completedDocs, has_min_5day_inpatient: e.target.checked })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="doc-min5day">
                                        Surat Rawat Inap ≥ 5 Hari <span className="badge bg-secondary ms-2">Opsional</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Claim Risk Assessment Panel */}
                    <div className="card shadow-sm border-0 mb-4 bg-white">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-shield-alert me-2"></i>
                                Claim Approval Risk Assessment
                            </h5>
                        </div>
                        <div className="card-body text-center py-4">
                            <div className="d-flex justify-content-center align-items-center mb-3">
                                <div className={`rounded-circle text-white d-flex flex-column justify-content-center align-items-center shadow`} style={{ width: "120px", height: "120px", background: validation.riskBadgeColor === "success" ? "#059669" : validation.riskBadgeColor === "warning" ? "#d97706" : "#dc2626" }}>
                                    <h2 className="fw-bold mb-0">{validation.riskScore}%</h2>
                                    <small style={{ fontSize: "0.7rem" }}>Risk Index</small>
                                </div>
                            </div>
                            
                            <h5 className="fw-bold text-dark">
                                Peluang Klaim Diterima: {" "}
                                <span className={`text-${validation.riskBadgeColor} text-uppercase`}>
                                    {validation.riskLevel === "low" ? "Tinggi" : validation.riskLevel === "medium" ? "Sedang" : "Rendah"}
                                </span>
                            </h5>

                            <div className="text-start mt-3">
                                {validation.errors.length > 0 && (
                                    <div className="alert alert-danger py-2 px-3 small">
                                        <div className="fw-bold mb-1">Critical Issues (Submit Terkunci):</div>
                                        <ul className="mb-0 ps-3">
                                            {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    </div>
                                )}
                                
                                {validation.warnings.length > 0 && (
                                    <div className="alert alert-warning py-2 px-3 small">
                                        <div className="fw-bold mb-1">Warnings / Alerts (Butuh Konfirmasi Dokter):</div>
                                        <ul className="mb-0 ps-3">
                                            {validation.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Projections */}
                    <div className="card shadow-sm border-0 mb-4 bg-white" style={{ borderLeft: "5px solid #059669" }}>
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold text-success">
                                <i className="bi bi-cash-stack me-2"></i>
                                Proyeksi Finansial Rumah Sakit
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-secondary">Plafon Pertanggungan BPJS (Claim Coverage):</span>
                                <span className="fw-bold text-dark">Rp {financials.coverage.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-secondary">Estimasi Biaya Rumah Sakit (Hospital Cost):</span>
                                <span className="fw-bold text-danger">Rp {financials.totalCost.toLocaleString('id-ID')}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-bold text-dark">Estimasi Net Profit/Loss:</span>
                                <span className={`fw-bold fs-5 ${financials.isProfitable ? 'text-success' : 'text-danger'}`}>
                                    {financials.profit >= 0 ? '+' : ''}Rp {financials.profit.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {financials.profit < 0 ? (
                                <div className="alert alert-danger py-2 small mb-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <strong>Loss Alert!</strong> Klaim ini memiliki estimasi biaya perawatan yang melebihi plafon pertanggungan BPJS. Lakukan penyesuaian severity level atau tindakan.
                                </div>
                            ) : (
                                <div className="alert alert-success py-2 small mb-0">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <strong>Profitable Claim!</strong> Estimasi pertanggungan aman dan menghasilkan profit positif bagi operasional Rumah Sakit.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Final submission gate */}
                    <div className="card shadow-sm border-0 bg-white">
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Catatan Peninjauan Dokter (Optional)</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder="Masukkan penjelasan diagnosis tambahan atau kronologi penyakit untuk klaim..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                className={`btn btn-lg w-100 py-3 ${validation.isValid ? 'btn-success' : 'btn-secondary'}`}
                                disabled={!validation.isValid || loading}
                                onClick={handleSubmitClaim}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Memproses Transaksi...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check me-2"></i>
                                        {validation.isValid ? "Submit Klaim Ke BPJS Gate" : "Submit Terkunci (Selesaikan Error)"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}