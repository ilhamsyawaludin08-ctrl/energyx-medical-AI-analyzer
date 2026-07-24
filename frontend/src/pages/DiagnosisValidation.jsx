import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function DiagnosisValidation() {
    const location = useLocation();
    const navigate = useNavigate();

    // Patient Context
    const [patientInfo, setPatientInfo] = useState(null);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [encounters, setEncounters] = useState([]);

    // Validation State
    const [selectedPrimaryDiagnosis, setSelectedPrimaryDiagnosis] = useState(null);
    const [selectedSecondaryDiagnoses, setSelectedSecondaryDiagnoses] = useState([]);
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [severityLevel, setSeverityLevel] = useState(1);
    
    // Document Requirements Checklist
    const [completedDocs, setCompletedDocs] = useState({
        has_medical_resume: false,
        has_lab_results: false,
        has_imaging: false,
        has_specialist_consultation: false,
        has_iv_therapy_proof: false,
        has_daily_care_notes: false,
        has_min_5day_inpatient: false,
    });

    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    // Search Autocomplete State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchTargetType, setSearchTargetType] = useState("primary");
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResultsDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize from location state (redirect from NewAnalysis) or load recent encounters
    useEffect(() => {
        if (location.state && location.state.analysisResult && location.state.patientData) {
            const aiData = location.state.analysisResult.data;
            const patientData = location.state.patientData;

            setPatientInfo({
                patient_id: patientData.patient_id,
                patient_name: patientData.patient_name,
                age: patientData.age,
                gender: patientData.gender,
                weight: patientData.weight,
                service_type: patientData.service_type,
                encounter_number: aiData.encounter_number || patientData.encounter_number || `ENC-${Date.now()}`,
                unit: "Poli Umum",
                subjective: patientData.subjective,
                objective: patientData.objective,
                assessment: patientData.assessment
            });

            setAiRecommendations(aiData);
            setSeverityLevel(aiData.severity_level || 1);
            
            // Map checklist base
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
                
                // Safely parse checklist
                let hasResume = false;
                let hasLab = false;
                let hasRad = false;
                let hasObs = false;
                
                if (severityObj && severityObj.checklist) {
                    try {
                        const parsed = JSON.parse(severityObj.checklist);
                        if (Array.isArray(parsed)) {
                            hasResume = parsed.includes("Resume Medis");
                            hasLab = parsed.includes("Laboratorium");
                            hasRad = parsed.includes("Radiologi");
                            hasObs = parsed.includes("Observasi");
                        } else if (typeof parsed === 'object') {
                            hasResume = !!parsed.resume_medis;
                            hasLab = !!parsed.hasil_laboratorium;
                            hasRad = !!parsed.hasil_radiologi;
                            hasObs = !!parsed.lembar_observasi;
                        }
                    } catch (e) {
                        // Fallback if it's a raw string
                        const raw = String(severityObj.checklist);
                        hasResume = raw.includes("Resume Medis") || raw.includes("resume_medis");
                        hasLab = raw.includes("Laboratorium") || raw.includes("hasil_laboratorium");
                        hasRad = raw.includes("Radiologi") || raw.includes("hasil_radiologi");
                        hasObs = raw.includes("Observasi") || raw.includes("lembar_observasi");
                    }
                }

                const aiData = {
                    diagnosis_primer: analysis.diagnosis ? analysis.diagnosis.filter(d => d.is_primary) : [],
                    diagnosis_sekunder: analysis.diagnosis ? analysis.diagnosis.filter(d => !d.is_primary) : [],
                    tindakan_medis: analysis.treatment || [],
                    severity_level: severityObj ? severityObj.level : 1,
                    severity_justifikasi: severityObj ? severityObj.justification : "",
                    resume_medis: hasResume,
                    hasil_laboratorium: hasLab,
                    hasil_radiologi: hasRad,
                    lembar_observasi: hasObs,
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
        const primaryAi = aiData.diagnosis_primer?.find(d => d.rekomendasi_ai || d.is_ai_recommendation) || aiData.diagnosis_primer?.[0];
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
                const treatmentInacbgLetter = t.inacbg.charAt(0).toUpperCase();
                if (/[A-Z]/.test(treatmentInacbgLetter) && primaryChapter !== treatmentInacbgLetter && treatmentInacbgLetter !== "Z" && treatmentInacbgLetter !== "U") {
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
        if (aiRecommendations && parseInt(aiRecommendations.severity_level, 10) !== level) {
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
        // 1. Treatment costs (Murni dari total harga tindakan yang dicentang user)
        const treatmentCost = selectedTreatments
            .filter(t => t.is_selected)
            .reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);

        const totalCost = treatmentCost;

        // 2. Coverage BPJS (Karena belum ada Grouper, diset 0 murni)
        const coverage = 0;
        
        // 3. Profit (Belum bisa dihitung)
        const profit = 0;

        return {
            coverage,
            totalCost,
            profit,
            isProfitable: true // Neutral status
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
                encounter_number: patientInfo.encounter_number,
                primary_diagnosis: selectedPrimaryDiagnosis.id,
                secondary_diagnosis: selectedSecondaryDiagnoses.map(d => d.id),
                treatment: selectedTreatments,
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
            <div className="container-fluid sc-animate-in mx-auto" style={{ padding: "2rem", maxWidth: "1440px" }}>
                <div className="sc-page-header">
                    <h2>
                        <i className="bi bi-clipboard2-pulse text-primary me-2"></i>
                        Diagnosis Validation
                    </h2>
                    <p>Pilih data kunjungan pasien (Encounter) yang sudah di-analisis oleh AI untuk divalidasi kodenya.</p>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="sc-section-header">
                            <i className="bi bi-clock-history text-muted"></i>
                            Recent Encounter AI Analyses
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5 sc-animate-in">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-3 text-muted">Memuat data kunjungan...</p>
                            </div>
                        ) : encounters.length === 0 ? (
                            <div className="sc-empty-state">
                                <i className="bi bi-folder-x sc-empty-icon"></i>
                                <h5>Belum ada riwayat analisis AI</h5>
                                <p>Silakan masuk ke menu <strong>New Analysis</strong> terlebih dahulu.</p>
                            </div>
                        ) : (
                            <div className="table-responsive border-0 mb-0">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Pasien</th>
                                            <th>No. RM</th>
                                            <th>Encounter No.</th>
                                            <th>Unit/Layanan</th>
                                            <th>Tanggal</th>
                                            <th className="text-end pe-4">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {encounters.map((enc, idx) => (
                                            <tr key={enc.id} className={`sc-stagger-${(idx % 5) + 1}`}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{enc.patient_name}</div>
                                                    <small className="text-muted">{enc.gender}, {enc.age} Th</small>
                                                </td>
                                                <td><span className="badge bg-light text-secondary border">{enc.patient_id}</span></td>
                                                <td><span className="badge bg-light text-secondary border">{enc.encounter_number}</span></td>
                                                <td>
                                                    <span className="sc-pill sc-pill-info">{enc.service_type}</span>
                                                </td>
                                                <td>{new Date(enc.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                                                <td className="text-end pe-4">
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
        <div className="container-fluid sc-animate-in mx-auto" style={{ padding: "2rem", maxWidth: "1440px" }}>
            {/* Top Navigation & Info Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => { setPatientInfo(null); setAiRecommendations(null); fetchRecentEncounters(); }}>
                        <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar
                    </button>
                    <h2 className="fw-bold mb-1 text-primary" style={{ letterSpacing: "-0.025em" }}>
                        🏥 Validasi Klaim: {patientInfo.patient_name}
                    </h2>
                    <div className="text-secondary small">
                        No. Encounter: <span className="badge bg-light text-dark border me-2">{patientInfo.encounter_number}</span>
                        RM: <span className="badge bg-light text-dark border me-2">{patientInfo.patient_id}</span>
                        Unit: <strong>{patientInfo.unit}</strong>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <span className="sc-pill sc-pill-info fs-6 px-3 py-2">
                        <i className="bi bi-heart-pulse me-1"></i> {patientInfo.service_type}
                    </span>
                    <span className="sc-pill bg-secondary text-white fs-6 px-3 py-2">
                        Severity AI: Level {aiRecommendations?.severity_level}
                    </span>
                </div>
            </div>

            {/* SOAP Context Summary Accordion */}
            <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift">
                <div className="card-body p-4">
                    <div className="row g-4 text-dark">
                        <div className="col-md-4 border-end">
                            <h6 className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Subjective (Keluhan)</h6>
                            <p className="mb-0 text-dark">{patientInfo.subjective}</p>
                        </div>
                        <div className="col-md-4 border-end">
                            <h6 className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Objective (Fisik/Vital)</h6>
                            <p className="mb-0 text-dark">{patientInfo.objective}</p>
                        </div>
                        <div className="col-md-4">
                            <h6 className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Assessment (Diagnosis Awal)</h6>
                            <p className="mb-0 text-dark">{patientInfo.assessment}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Validation Layout: Two Columns */}
            <div className="row g-4">
                
                {/* RIGHT COLUMN (VISUALLY): AI Recommendations References */}
                <div className="col-lg-4 order-lg-2 mb-4">
                    
                    {/* AI Diagnosis suggestions */}
                    <div className="card shadow-sm border-0 mb-4 sc-card-accent-ai sc-hover-glow bg-ai-subtle">
                        <div className="card-header bg-transparent border-bottom-0 py-3 pb-0">
                            <div className="sc-section-header text-ai">
                                <i className="bi bi-cpu"></i>
                                Rekomendasi Diagnosis AI
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-secondary text-uppercase border-bottom pb-2 mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Diagnosis Primer</h6>
                            {aiRecommendations?.diagnosis_primer?.map((diag, idx) => (
                                <div key={idx} className="p-3 mb-4 bg-light rounded border sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-ai) !important" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="fw-bold text-dark mb-0">
                                            <span className="badge bg-white text-ai border me-2">{diag.kode || diag.code}</span>
                                            {diag.nama || diag.title}
                                        </h6>
                                        <span className="sc-pill sc-pill-ai">Conf: {diag.confidence}%</span>
                                    </div>
                                    <div className="small text-muted p-2 bg-white rounded border mb-2">
                                        <strong>Alasan:</strong> {diag.alasan || diag.reason}
                                    </div>
                                    <small className="text-secondary d-flex align-items-center">
                                        <i className="bi bi-tag-fill me-1 text-ai"></i> INACBG Group: <strong>{diag.inacbg || "A"}</strong>
                                    </small>
                                </div>
                            ))}

                            <h6 className="fw-bold text-secondary text-uppercase border-bottom pb-2 mt-4 mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Diagnosis Sekunder</h6>
                            {aiRecommendations?.diagnosis_sekunder?.length === 0 ? (
                                <p className="text-muted small">Tidak ada saran diagnosis sekunder.</p>
                            ) : (
                                aiRecommendations?.diagnosis_sekunder?.map((diag, idx) => (
                                    <div key={idx} className="p-3 mb-3 bg-light rounded border sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-ai) !important" }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-semibold text-dark">
                                                <span className="badge bg-white text-ai border me-2">{diag.kode || diag.code}</span>
                                                {diag.nama || diag.title}
                                            </div>
                                            <span className="sc-pill sc-pill-ai">Conf: {diag.confidence}%</span>
                                        </div>
                                        <div className="small text-muted" style={{ fontSize: "0.8rem" }}>
                                            <strong>Alasan:</strong> {diag.alasan || diag.reason}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AI Medical Treatment suggestions */}
                    <div className="card shadow-sm border-0 mb-4 sc-card-accent-ai sc-hover-glow bg-ai-subtle">
                        <div className="card-header bg-transparent border-bottom-0 py-3 pb-0">
                            <div className="sc-section-header text-ai">
                                <i className="bi bi-activity"></i>
                                Rekomendasi Tindakan (ICD-9-CM)
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {aiRecommendations?.tindakan_medis?.length === 0 ? (
                                <p className="text-muted">Tidak ada rekomendasi tindakan medis.</p>
                            ) : (
                                aiRecommendations?.tindakan_medis?.map((action, idx) => (
                                    <div key={idx} className="p-3 mb-3 bg-light rounded border sc-hover-lift">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-bold text-dark">
                                                <span className="badge bg-white text-secondary border me-2">{action.kode || action.code}</span>
                                                {action.nama || action.title}
                                            </div>
                                            <span className="sc-pill bg-secondary text-white">Rec: {action.confidence || 90}%</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.8rem" }}>
                                            <span className="text-muted"><i className="bi bi-bookmark me-1"></i> {action.kategori || action.category}</span>
                                            <span className="text-success fw-bold"><i className="bi bi-link-45deg me-1"></i> INACBG: {action.inacbg}</span>
                                        </div>
                                        <div className="small text-muted p-2 bg-white rounded border"><strong>Justifikasi:</strong> {action.alasan || action.reason}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* LEFT COLUMN (VISUALLY): Doctor Selections & Interactive Rules Engine */}
                <div className="col-lg-8 order-lg-1">
                    
                    {/* Doctor selection input panel */}
                    <div className="card shadow-sm border-0 mb-4 sc-card-accent-primary sc-hover-glow">
                        <div className="card-header bg-white py-3">
                            <div className="sc-section-header text-primary">
                                <i className="bi bi-file-earmark-medical"></i>
                                Diagnosis Final (Doctor Selection)
                            </div>
                        </div>
                        <div className="card-body p-4">
                            
                            {/* Search autocomplete container */}
                            <div className="mb-4 position-relative" ref={dropdownRef}>
                                <label className="form-label text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                                    Cari Master Diagnosis ICD-10
                                </label>
                                <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Ketik kode ICD atau nama penyakit..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setShowResultsDropdown(true); }}
                                        onFocus={() => setShowResultsDropdown(true)}
                                    />
                                    <select
                                        className="form-select bg-light fw-semibold"
                                        style={{ maxWidth: "160px", borderLeft: "1px solid var(--sc-border)" }}
                                        value={searchTargetType}
                                        onChange={(e) => setSearchTargetType(e.target.value)}
                                    >
                                        <option value="primary">Primer</option>
                                        <option value="secondary">Sekunder</option>
                                    </select>
                                </div>

                                {showResultsDropdown && searchResults.length > 0 && (
                                    <ul className="list-group position-absolute w-100 mt-2 shadow-lg z-3 overflow-y-auto" style={{ maxHeight: "300px", borderRadius: "var(--sc-radius-md)" }}>
                                        {searchResults.map((diag) => (
                                            <li
                                                key={diag.id}
                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-bottom"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleSelectDiagnosis(diag)}
                                            >
                                                <div>
                                                    <span className="badge bg-secondary me-2">{diag.icd10_code}</span>
                                                    <strong className="text-dark">{diag.disease_name}</strong>
                                                    <div className="small text-muted mt-1">{diag.doctor_diagnosis}</div>
                                                </div>
                                                {searchTargetType === 'primary' && diag.claim > 0 && <div className="text-success fw-bold mb-1 fs-6">Rp {parseFloat(diag.claim).toLocaleString('id-ID')}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Display chosen primary diagnosis */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Diagnosis Primer Terpilih (Wajib 1)</h6>
                                {selectedPrimaryDiagnosis ? (
                                    <div className="p-3 bg-white border border-success rounded d-flex justify-content-between align-items-center sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-success) !important" }}>
                                        <div>
                                            <span className="badge bg-success me-3 p-2 fs-6">{selectedPrimaryDiagnosis.icd10_code}</span>
                                            <strong className="fs-6">{selectedPrimaryDiagnosis.disease_name}</strong>
                                            <div className="small text-muted mt-1">{selectedPrimaryDiagnosis.doctor_diagnosis}</div>
                                        </div>
                                        <div className="text-end">
                                            {selectedPrimaryDiagnosis.claim > 0 && <div className="text-success fw-bold mb-1 fs-5">Rp {parseFloat(selectedPrimaryDiagnosis.claim).toLocaleString('id-ID')}</div>}
                                            <button className="btn btn-sm btn-outline-danger py-1 px-2" onClick={() => setSelectedPrimaryDiagnosis(null)}>
                                                <i className="bi bi-trash me-1"></i> Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-danger mb-0 d-flex align-items-center">
                                        <i className="bi bi-exclamation-octagon fs-4 me-3"></i>
                                        <div>
                                            <strong>Belum ada diagnosis primer terpilih.</strong>
                                            <div className="small mt-1">Cari dan pilih melalui kolom pencarian di atas.</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Display chosen secondary diagnoses */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Diagnosis Sekunder Terpilih (Maksimal 2)</h6>
                                {selectedSecondaryDiagnoses.length === 0 ? (
                                    <div className="p-3 bg-light border rounded text-center text-muted border-dashed">
                                        <i className="bi bi-inbox fs-4 d-block mb-2 text-black-50"></i>
                                        Belum ada diagnosis sekunder terpilih.
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {selectedSecondaryDiagnoses.map((diag) => (
                                            <div key={diag.id} className="p-3 bg-white border rounded d-flex justify-content-between align-items-center sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-secondary) !important" }}>
                                                <div>
                                                    <span className="badge bg-secondary me-3 p-2 fs-6">{diag.icd10_code}</span>
                                                    <span className="fw-semibold text-dark fs-6">{diag.disease_name}</span>
                                                </div>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => removeSecondaryDiagnosis(diag.id)}>
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Treatment Selection final */}
                            <div className="mb-2">
                                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Tindakan Medis Terpilih (ICD-9-CM)</h6>
                                <div className="d-flex flex-column gap-2">
                                    {selectedTreatments.map((t) => (
                                        <div key={t.code} className={`p-3 border rounded d-flex justify-content-between align-items-center sc-hover-border ${t.is_selected ? 'bg-light border-primary shadow-sm' : 'bg-white'}`} style={{ transition: "all 0.2s" }}>
                                            <div className="form-check d-flex align-items-center m-0">
                                                <input
                                                    className="form-check-input me-3"
                                                    style={{ width: "1.25rem", height: "1.25rem" }}
                                                    type="checkbox"
                                                    id={`doc-t-${t.code}`}
                                                    checked={t.is_selected}
                                                    onChange={() => toggleTreatment(t.code)}
                                                />
                                                <label className="form-check-label text-dark" htmlFor={`doc-t-${t.code}`} style={{ cursor: "pointer" }}>
                                                    <span className="badge bg-white border text-dark me-2">{t.code}</span>
                                                    <strong className={t.is_selected ? "text-dark" : "text-muted"}>{t.title}</strong>
                                                </label>
                                            </div>
                                            <span className="sc-pill sc-pill-primary opacity-75">Rp {parseFloat(t.cost).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Checklist Panel */}
                    <div className="card shadow-sm border-0 mb-4 sc-card-accent-warning sc-hover-glow">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <div className="sc-section-header text-warning">
                                <i className="bi bi-file-earmark-check"></i>
                                BPJS Documents Checklist
                            </div>
                            <div className="d-flex align-items-center bg-light px-3 py-1 rounded border">
                                <label className="me-2 fw-bold text-dark mb-0 small text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Severity Level:</label>
                                <select className="form-select form-select-sm border-0 bg-transparent fw-bold text-primary" style={{ width: "auto", boxShadow: "none", padding: "0 1.5rem 0 0.5rem" }} value={severityLevel} onChange={(e) => setSeverityLevel(parseInt(e.target.value, 10))}>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <p className="text-muted small mb-4 bg-light p-3 rounded border">
                                <i className="bi bi-info-circle text-primary me-2"></i>
                                Dokumen wajib ditentukan berdasarkan <strong>Severity Level {severityLevel}</strong>. Kelalaian melengkapi berkas ini akan menyebabkan klaim tertunda atau ditolak.
                            </p>
                            
                            <div className="d-flex flex-column gap-2">
                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_medical_resume ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-resume" checked={completedDocs.has_medical_resume} onChange={(e) => setCompletedDocs({ ...completedDocs, has_medical_resume: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-resume">Resume Medis Lengkap</label>
                                    <span className="sc-pill sc-pill-danger">Wajib Lvl 1,2,3</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_lab_results ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-lab" checked={completedDocs.has_lab_results} onChange={(e) => setCompletedDocs({ ...completedDocs, has_lab_results: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-lab">Hasil Pemeriksaan Lab</label>
                                    <span className={`sc-pill ${severityLevel >= 2 ? 'sc-pill-danger' : 'bg-secondary text-white'}`}>{severityLevel >= 2 ? 'Wajib Lvl 2,3' : 'Disarankan'}</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_imaging ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-imaging" checked={completedDocs.has_imaging} onChange={(e) => setCompletedDocs({ ...completedDocs, has_imaging: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-imaging">Hasil Radiologi / Imaging</label>
                                    <span className={`sc-pill ${severityLevel >= 3 ? 'sc-pill-danger' : severityLevel === 2 ? 'sc-pill-warning' : 'bg-secondary text-white'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : severityLevel === 2 ? 'Disarankan' : 'Opsional'}</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_specialist_consultation ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-specialist" checked={completedDocs.has_specialist_consultation} onChange={(e) => setCompletedDocs({ ...completedDocs, has_specialist_consultation: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-specialist">Konsultasi Dokter Spesialis</label>
                                    <span className={`sc-pill ${severityLevel >= 2 ? 'sc-pill-danger' : 'bg-secondary text-white'}`}>{severityLevel >= 2 ? 'Wajib Lvl 2,3' : 'Opsional'}</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_iv_therapy_proof ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-iv" checked={completedDocs.has_iv_therapy_proof} onChange={(e) => setCompletedDocs({ ...completedDocs, has_iv_therapy_proof: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-iv">Bukti Terapi IV (Insulin, Infus)</label>
                                    <span className={`sc-pill ${severityLevel >= 3 ? 'sc-pill-danger' : 'bg-secondary text-white'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : 'Opsional'}</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_daily_care_notes ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-notes" checked={completedDocs.has_daily_care_notes} onChange={(e) => setCompletedDocs({ ...completedDocs, has_daily_care_notes: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-notes">Catatan Harian Perawatan</label>
                                    <span className={`sc-pill ${severityLevel >= 3 ? 'sc-pill-danger' : severityLevel === 2 ? 'sc-pill-warning' : 'bg-secondary text-white'}`}>{severityLevel >= 3 ? 'Wajib Lvl 3' : severityLevel === 2 ? 'Disarankan' : 'Opsional'}</span>
                                </div>

                                <div className={`form-check p-3 border rounded d-flex align-items-center sc-hover-border ${completedDocs.has_min_5day_inpatient ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                                    <input className="form-check-input ms-0 me-3 mt-0" style={{ width: "1.25rem", height: "1.25rem" }} type="checkbox" id="doc-min5day" checked={completedDocs.has_min_5day_inpatient} onChange={(e) => setCompletedDocs({ ...completedDocs, has_min_5day_inpatient: e.target.checked })} />
                                    <label className="form-check-label text-dark flex-grow-1 fw-medium" htmlFor="doc-min5day">Surat Rawat Inap ≥ 5 Hari</label>
                                    <span className="sc-pill bg-secondary text-white">Opsional</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Claim Risk Assessment Panel */}
                    <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift">
                        <div className="card-header bg-white py-3">
                            <div className="sc-section-header text-dark">
                                <i className="bi bi-shield-check"></i>
                                Claim Approval Risk Assessment
                            </div>
                        </div>
                        <div className="card-body py-5 px-4 text-center" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
                            <div className="d-flex justify-content-center align-items-center mb-4">
                                <div className="rounded-circle text-white d-flex flex-column justify-content-center align-items-center shadow-lg" 
                                     style={{ 
                                         width: "140px", 
                                         height: "140px", 
                                         background: validation.riskBadgeColor === "success" ? "linear-gradient(135deg, #22C55E 0%, #15803d 100%)" : 
                                                     validation.riskBadgeColor === "warning" ? "linear-gradient(135deg, #F59E0B 0%, #b45309 100%)" : 
                                                     "linear-gradient(135deg, #EF4444 0%, #b91c1c 100%)",
                                         border: "4px solid rgba(255,255,255,0.2)"
                                     }}>
                                    <h1 className="fw-bold mb-0" style={{ fontSize: "3.5rem", letterSpacing: "-0.05em" }}>{validation.riskScore}</h1>
                                    <span className="fw-semibold opacity-75 text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}>Score</span>
                                </div>
                            </div>
                            
                            <h4 className="fw-bold text-dark mb-1">
                                Peluang Klaim Diterima: {" "}
                                <span className={`text-${validation.riskBadgeColor} text-uppercase`}>
                                    {validation.riskLevel === "low" ? "Tinggi" : validation.riskLevel === "medium" ? "Sedang" : "Rendah"}
                                </span>
                            </h4>
                            <p className="text-muted small mb-4">Skor dihitung secara real-time berdasarkan kelengkapan berkas, koherensi medis, dan aturan BPJS.</p>

                            <div className="text-start mt-4">
                                {validation.errors.length > 0 && (
                                    <div className="alert alert-danger p-4 mb-3 shadow-sm border-0 sc-animate-up">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-x-circle-fill fs-4 me-2"></i>
                                            <h6 className="fw-bold mb-0">Critical Issues (Submit Terkunci)</h6>
                                        </div>
                                        <ul className="mb-0 ps-3 text-dark">
                                            {validation.errors.map((err, i) => <li key={i} className="mb-1">{err}</li>)}
                                        </ul>
                                    </div>
                                )}
                                
                                {validation.warnings.length > 0 && (
                                    <div className="alert alert-warning p-4 shadow-sm border-0 sc-animate-up">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
                                            <h6 className="fw-bold mb-0">Warnings / Alerts (Butuh Konfirmasi Dokter)</h6>
                                        </div>
                                        <ul className="mb-0 ps-3 text-dark">
                                            {validation.warnings.map((warn, i) => <li key={i} className="mb-1">{warn}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>



                    {/* Financial Projections - Real Data Only */}
                    <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-primary) !important" }}>
                        <div className="card-header bg-white py-3">
                            <div className="sc-section-header text-primary">
                                <i className="bi bi-cash-stack"></i>
                                Proyeksi Finansial Rumah Sakit
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="p-3 bg-light rounded border mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-secondary fw-medium">Plafon Pertanggungan BPJS (Claim Coverage):</span>
                                    {selectedPrimaryDiagnosis && selectedPrimaryDiagnosis.claim > 0 ? (
                                        <span className="fw-bold text-success fs-5">Rp {parseFloat(selectedPrimaryDiagnosis.claim).toLocaleString('id-ID')}</span>
                                    ) : (
                                        <span className="fw-bold text-dark fs-5 text-muted">Menunggu Diagnosis Primer</span>
                                    )}
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-secondary fw-medium">Estimasi Biaya Rumah Sakit (Hospital Cost):</span>
                                    <span className="fw-bold text-dark fs-5">Rp {financials.totalCost.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            
                            <div className={`d-flex justify-content-between align-items-center p-3 rounded border ${selectedPrimaryDiagnosis && selectedPrimaryDiagnosis.claim > 0 ? (parseFloat(selectedPrimaryDiagnosis.claim) - financials.totalCost >= 0 ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger') : 'bg-light'}`}>
                                <span className="fw-bold text-dark fs-5">Estimasi Net Profit/Loss:</span>
                                {selectedPrimaryDiagnosis && selectedPrimaryDiagnosis.claim > 0 ? (
                                    <span className={`fw-bold fs-5 ${parseFloat(selectedPrimaryDiagnosis.claim) - financials.totalCost >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {parseFloat(selectedPrimaryDiagnosis.claim) - financials.totalCost >= 0 ? '+' : '-'} Rp {Math.abs(parseFloat(selectedPrimaryDiagnosis.claim) - financials.totalCost).toLocaleString('id-ID')}
                                    </span>
                                ) : (
                                    <span className="fw-bold fs-5 text-muted">
                                        Menunggu Diagnosis
                                    </span>
                                )}
                            </div>

                            <div className="mt-3">
                                {selectedPrimaryDiagnosis && selectedPrimaryDiagnosis.claim > 0 ? (
                                    <div className="alert alert-success py-2 small mb-0 d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill fs-5 me-2"></i>
                                        <span><strong>Proyeksi Tersedia.</strong> Plafon di atas adalah estimasi plafon klaim BPJS untuk diagnosis primer yang Anda pilih. Nilai akhir bergantung pada grouping INA-CBG final.</span>
                                    </div>
                                ) : (
                                    <div className="alert alert-info py-2 small mb-0 d-flex align-items-center">
                                        <i className="bi bi-info-circle-fill fs-5 me-2"></i>
                                        <span><strong>Proyeksi belum tersedia.</strong> Profit/Loss baru dapat dihitung setelah diagnosis primer dipilih. Biaya Rumah Sakit di atas adalah murni total dari tindakan medis yang Anda pilih.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Final submission gate */}
                    <div className="card shadow-lg border-0 bg-white mb-4">
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Catatan Peninjauan Dokter (Optional)</label>
                                <textarea
                                    className="form-control bg-light"
                                    rows="2"
                                    placeholder="Masukkan penjelasan diagnosis tambahan atau kronologi penyakit untuk lampiran BPJS..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                className={`btn btn-lg w-100 py-3 d-flex justify-content-center align-items-center shadow-sm ${validation.isValid ? 'btn-success' : 'btn-secondary'}`}
                                disabled={!validation.isValid || loading}
                                onClick={handleSubmitClaim}
                                style={{ fontSize: "1.1rem", fontWeight: "700", transition: "all 0.3s" }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true" style={{ width: "1.5rem", height: "1.5rem" }}></span>
                                        Memproses Transaksi ke BPJS Gate...
                                    </>
                                ) : (
                                    <>
                                        <i className={`bi ${validation.isValid ? 'bi-cloud-arrow-up-fill' : 'bi-lock-fill'} me-2 fs-4`}></i>
                                        {validation.isValid ? "SUBMIT KLAIM KE BPJS GATE" : "SUBMIT TERKUNCI (SELESAIKAN ERROR)"}
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