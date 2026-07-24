import { useState, useEffect } from "react";
import api from "../api/api";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedTx, setSelectedTx] = useState(null); // Selected transaction for detail modal
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const fetchTransactions = async (page = 1, searchQuery = "", status = "") => {
        try {
            setLoading(true);
            const limit = 10;
            let url = `/transactions?page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            if (status) url += `&status=${status}`;

            const response = await api.get(url);
            if (response.data && response.data.data) {
                setTransactions(response.data.data);
                if (response.data.pagination) {
                    const pag = response.data.pagination;
                    setPagination({
                        currentPage: pag.currentPage,
                        totalPages: pag.totalPages,
                        totalItems: pag.totalItems
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(1, search, statusFilter);
    }, [search, statusFilter]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchTransactions(page, search, statusFilter);
        }
    };

    return (
        <div className="container-fluid sc-animate-in" style={{ padding: "2rem" }}>
            {/* Header */}
            <div className="sc-page-header">
                <h2>
                    <i className="bi bi-cash-stack text-primary me-2"></i>
                    BPJS Claims Transactions
                </h2>
                <p>Daftar transaksi pengajuan klaim BPJS yang telah selesai divalidasi oleh sistem.</p>
            </div>

            {/* Filter Panel */}
            <div className="card shadow-sm border-0 mb-4 bg-white sc-hover-lift">
                <div className="card-body p-4">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-8">
                            <label className="form-label text-secondary text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", fontWeight: "600" }}>Cari Pasien</label>
                            <div className="input-group input-group-lg shadow-sm">
                                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Cari nama pasien, atau diagnosa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <label className="form-label text-secondary text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", fontWeight: "600" }}>Filter Status Dokumen</label>
                            <select
                                className="form-select form-select-lg shadow-sm text-dark fw-medium"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Semua Status Dokumen</option>
                                <option value="selesai">Selesai (Validated)</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="card shadow-sm border-0 bg-white sc-hover-lift">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5 sc-animate-in">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted">Memuat riwayat transaksi...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="sc-empty-state">
                            <i className="bi bi-cash-stack sc-empty-icon"></i>
                            <h5>Belum ada catatan transaksi klaim</h5>
                            <p>Sistem tidak menemukan transaksi BPJS untuk kriteria ini.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive border-0 mb-0">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Pasien</th>
                                            <th>Diagnosis Utama</th>
                                            <th>Plafon Pertanggungan</th>
                                            <th>Biaya Perawatan</th>
                                            <th>Net Profit/Loss</th>
                                            <th>Berkas</th>
                                            <th>Status</th>
                                            <th className="text-end pe-4">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx, idx) => {
                                            const claimAmount = parseFloat(tx.primary_diagnosis?.claim || tx.coverage_amount || 0);
                                            const costAmount = parseFloat(tx.cost_amount || 0);
                                            const profit = claimAmount - costAmount;
                                            const isProfitable = profit >= 0;
                                            return (
                                                <tr key={tx.id} className={`sc-stagger-${(idx % 5) + 1}`}>
                                                    <td className="ps-4">
                                                        <div className="fw-bold text-dark">{tx.patient_name}</div>
                                                        <small className="text-muted d-flex align-items-center mt-1">
                                                            <i className="bi bi-calendar3 me-1"></i>
                                                            {new Date(tx.transaction_date || tx.created_at).toLocaleDateString('id-ID')}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        {tx.primary_diagnosis ? (
                                                            <div>
                                                                <span className="badge bg-white text-secondary border me-2">{tx.primary_diagnosis.icd10_code}</span>
                                                                <span className="text-dark fw-semibold">{tx.primary_diagnosis.disease_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>
                                                    <td className="fw-medium text-dark">Rp {claimAmount.toLocaleString('id-ID')}</td>
                                                    <td className="fw-medium text-danger">Rp {costAmount.toLocaleString('id-ID')}</td>
                                                    <td className={isProfitable ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                        <span className={isProfitable ? "sc-pill sc-pill-success" : "sc-pill sc-pill-danger"}>
                                                            {isProfitable ? "+" : ""}Rp {profit.toLocaleString('id-ID')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={tx.document_status === "lengkap" ? 'sc-pill sc-pill-success' : 'sc-pill sc-pill-warning'}>
                                                            {tx.document_status === "lengkap" ? 'Lengkap' : 'Incomplete'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="sc-pill sc-pill-primary text-uppercase">{tx.status || 'Validated'}</span>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm rounded-circle shadow-sm"
                                                            style={{ width: "36px", height: "36px" }}
                                                            onClick={() => setSelectedTx(tx)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
                                    <span className="text-secondary small fw-medium text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        Halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.totalPages}</strong> <span className="opacity-75">({pagination.totalItems} transaksi)</span>
                                    </span>
                                    <ul className="pagination mb-0 shadow-sm">
                                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link text-primary fw-bold" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                                <button className="page-link fw-bold" onClick={() => handlePageChange(page)}>{page}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link text-primary fw-bold" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Claim Details Modal Popup */}
            {selectedTx && (
                <div className="modal show d-block sc-animate-in" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "var(--sc-radius-xl)" }}>
                            
                            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-start">
                                <div>
                                    <span className="sc-pill sc-pill-primary mb-2 d-inline-block text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>Detail Klaim</span>
                                    <h4 className="modal-title fw-bold text-dark mb-0">{selectedTx.patient_name}</h4>
                                </div>
                                <button type="button" className="btn-close bg-light rounded-circle p-2 shadow-sm" onClick={() => setSelectedTx(null)}></button>
                            </div>
                            
                            <div className="modal-body p-4 text-dark">
                                <div className="row g-4 mb-4">
                                    <div className="col-md-6 border-end pe-4">
                                        <h6 className="fw-bold text-secondary text-uppercase small mb-3" style={{ letterSpacing: "0.05em" }}>Diagnosis Primer</h6>
                                        {selectedTx.primary_diagnosis ? (
                                            <div className="p-3 bg-light rounded border sc-hover-lift" style={{ borderLeft: "4px solid var(--sc-success) !important" }}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="badge bg-white text-success border me-2">{selectedTx.primary_diagnosis.icd10_code}</span>
                                                    <strong className="text-dark">{selectedTx.primary_diagnosis.disease_name}</strong>
                                                </div>
                                                <div className="text-muted small bg-white p-2 border rounded">{selectedTx.primary_diagnosis.doctor_diagnosis}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}

                                        <h6 className="fw-bold text-secondary text-uppercase small mt-4 mb-3" style={{ letterSpacing: "0.05em" }}>Diagnosis Sekunder</h6>
                                        {selectedTx.secondary_diagnosis && selectedTx.secondary_diagnosis.length > 0 ? (
                                            <div className="d-flex flex-column gap-2">
                                                {selectedTx.secondary_diagnosis.map((d) => (
                                                    <div key={d.id} className="p-2 bg-light border rounded text-dark small d-flex align-items-center">
                                                        <span className="badge bg-white text-secondary border me-2">{d.icd10_code}</span>
                                                        <span className="fw-medium">{d.disease_name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-light rounded border border-dashed text-muted text-center small">
                                                Tidak ada diagnosis sekunder
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6 ps-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-secondary text-uppercase small mb-0" style={{ letterSpacing: "0.05em" }}>Document Checklist</h6>
                                            <span className="sc-pill bg-light text-dark fw-bold border">Lvl {selectedTx.document_checklist?.severity_level || 1}</span>
                                        </div>
                                        <div className="d-flex flex-column gap-2 mb-4">
                                            {[
                                                { label: "Resume Medis", val: selectedTx.document_checklist?.has_medical_resume },
                                                { label: "Hasil Laboratorium", val: selectedTx.document_checklist?.has_lab_results },
                                                { label: "Hasil Radiologi/Imaging", val: selectedTx.document_checklist?.has_imaging },
                                                { label: "Konsultasi Spesialis", val: selectedTx.document_checklist?.has_specialist_consultation },
                                                { label: "Terapi IV", val: selectedTx.document_checklist?.has_iv_therapy_proof }
                                            ].map((item, idx) => (
                                                <div key={idx} className={`p-2 border rounded d-flex justify-content-between align-items-center ${item.val ? 'bg-success-subtle border-success' : 'bg-light'}`}>
                                                    <span className="text-dark fw-medium small">{item.label}</span>
                                                    {item.val ? (
                                                        <i className="bi bi-check-circle-fill text-success"></i>
                                                    ) : (
                                                        <i className="bi bi-x-circle text-muted"></i>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-light border rounded mb-4 sc-hover-lift">
                                    <h6 className="fw-bold text-secondary text-uppercase small mb-2 d-flex align-items-center" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bi bi-chat-square-text me-2"></i>Catatan Dokter
                                    </h6>
                                    <p className="mb-0 text-dark">{selectedTx.notes || <span className="text-muted fst-italic">Tidak ada catatan.</span>}</p>
                                </div>

                                <div className="row g-3 text-center">
                                    <div className="col-4">
                                        <div className="border rounded p-3 bg-light shadow-sm sc-hover-lift">
                                            <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>Prediksi Plafon</span>
                                            {selectedTx.primary_diagnosis && selectedTx.primary_diagnosis.claim > 0 ? (
                                                <strong className="text-success fs-5">Rp {parseFloat(selectedTx.primary_diagnosis.claim).toLocaleString('id-ID')}</strong>
                                            ) : (
                                                <strong className="text-muted fs-6">Menunggu INA-CBG</strong>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border rounded p-3 bg-white shadow-sm sc-hover-lift">
                                            <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>Hospital Cost</span>
                                            <strong className="text-dark fs-5">Rp {parseFloat(selectedTx.cost_amount || 0).toLocaleString('id-ID')}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className={`border rounded p-3 shadow-sm sc-hover-lift ${selectedTx.primary_diagnosis && selectedTx.primary_diagnosis.claim > 0 ? (parseFloat(selectedTx.primary_diagnosis.claim) - parseFloat(selectedTx.cost_amount || 0) >= 0 ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger') : 'bg-light'}`}>
                                            <span className="text-secondary small d-block text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>Profit/Loss</span>
                                            {selectedTx.primary_diagnosis && selectedTx.primary_diagnosis.claim > 0 ? (
                                                <strong className={`fs-5 ${parseFloat(selectedTx.primary_diagnosis.claim) - parseFloat(selectedTx.cost_amount || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {parseFloat(selectedTx.primary_diagnosis.claim) - parseFloat(selectedTx.cost_amount || 0) >= 0 ? '+' : '-'} Rp {Math.abs(parseFloat(selectedTx.primary_diagnosis.claim) - parseFloat(selectedTx.cost_amount || 0)).toLocaleString('id-ID')}
                                                </strong>
                                            ) : (
                                                <strong className="text-muted fs-6">Menunggu INA-CBG</strong>
                                            )}
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}