import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Encounters() {
    const navigate = useNavigate();
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0
    });

    const fetchEncounters = async (page = 1, searchQuery = "") => {
        try {
            setLoading(true);
            const limit = 10;
            const offset = (page - 1) * limit;
            const response = await api.get(`/v1/service/encounters?limit=${limit}&offset=${offset}&search=${searchQuery}`);
            if (response.data && response.data.data) {
                const { rows, totalPages, totalRecords, currentPage } = response.data.data;
                setEncounters(rows);
                setPagination({
                    currentPage,
                    totalPages,
                    totalRecords
                });
            }
        } catch (err) {
            console.error("Failed to load encounters", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEncounters(1, search);
    }, [search]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchEncounters(page, search);
        }
    };

    return (
        <div className="container-fluid" style={{ background: "#f8fafc" }}>
            {/* Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold text-primary mb-1">
                        <i className="bi bi-person-lines-fill me-2"></i>
                        Encounters
                    </h2>
                    <p className="text-muted mb-0">Kelola dan tinjau seluruh riwayat kunjungan pasien yang terdaftar di rumah sakit.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("/analysis")}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Analisis Baru
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Pencarian Pasien / Encounter</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Cari nama pasien, nomor RM, atau encounter..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Encounters List */}
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Memuat data kunjungan...</p>
                        </div>
                    ) : encounters.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-folder-x fs-1 text-muted"></i>
                            <p className="mt-3 text-muted">Data kunjungan tidak ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Pasien</th>
                                            <th>No. RM</th>
                                            <th>No. Encounter</th>
                                            <th>Layanan</th>
                                            <th>Diagnosis SOAP</th>
                                            <th>Tanggal Masuk</th>
                                            <th className="text-end">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {encounters.map((enc) => (
                                            <tr key={enc.id}>
                                                <td>
                                                    <div className="fw-bold text-dark">{enc.patient_name}</div>
                                                    <small className="text-muted">
                                                        {enc.gender === "Laki-laki" || enc.gender === "L" || enc.gender === "Male" ? "Laki-laki" : "Perempuan"} | {enc.age} Th
                                                    </small>
                                                </td>
                                                <td><code>{enc.patient_id}</code></td>
                                                <td><code>{enc.encounter_number}</code></td>
                                                <td>
                                                    <span className={`badge ${enc.service_type === "Rawat Inap" ? 'bg-info' : 'bg-light text-dark'}`}>
                                                        {enc.service_type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: "200px" }} title={enc.assesment}>
                                                        {enc.assesment || "-"}
                                                    </div>
                                                </td>
                                                <td>{new Date(enc.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => navigate("/diagnosis", { state: { encounterNumber: enc.encounter_number } })}
                                                    >
                                                        <i className="bi bi-shield-check me-1"></i>
                                                        Validasi Klaim
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <nav className="d-flex justify-content-between align-items-center mt-4">
                                    <span className="text-muted small">
                                        Menampilkan halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.totalPages}</strong> ({pagination.totalRecords} records)
                                    </span>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>Sebelumnya</button>
                                        </li>
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>Selanjutnya</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}