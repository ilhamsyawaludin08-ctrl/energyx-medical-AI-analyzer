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
        <div className="container-fluid" style={{ background: "#f8fafc" }}>
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-primary mb-1">
                    <i className="bi bi-cash-stack me-2"></i>
                    BPJS Claims Transactions
                </h2>
                <p className="text-muted mb-0">Daftar transaksi pengajuan klaim BPJS yang telah selesai divalidasi oleh sistem.</p>
            </div>

            {/* Filter Panel */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6 col-lg-8">
                            <label className="form-label fw-bold small">Cari Pasien</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Cari nama pasien, atau diagnosa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <label className="form-label fw-bold small">Filter Status Dokumen</label>
                            <select
                                className="form-select"
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
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Memuat riwayat transaksi...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-cash-stack fs-1 text-muted"></i>
                            <p className="mt-3 text-muted">Belum ada catatan transaksi klaim BPJS.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Pasien</th>
                                            <th>Diagnosis Utama</th>
                                            <th>Plafon Pertanggungan</th>
                                            <th>Biaya Perawatan</th>
                                            <th>Net Profit/Loss</th>
                                            <th>Berkas</th>
                                            <th>Status</th>
                                            <th className="text-end">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => {
                                            const profit = parseFloat(tx.profit_amount || 0);
                                            const isProfitable = profit >= 0;
                                            return (
                                                <tr key={tx.id}>
                                                    <td>
                                                        <div className="fw-bold text-dark">{tx.patient_name}</div>
                                                        <small className="text-muted">
                                                            {new Date(tx.transaction_date || tx.created_at).toLocaleDateString('id-ID')}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        {tx.primary_diagnosis ? (
                                                            <div>
                                                                <span className="badge bg-secondary me-1">{tx.primary_diagnosis.icd10_code}</span>
                                                                <small className="text-dark fw-semibold">{tx.primary_diagnosis.disease_name}</small>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>
                                                    <td>Rp {parseFloat(tx.coverage_amount || 0).toLocaleString('id-ID')}</td>
                                                    <td className="text-danger">Rp {parseFloat(tx.cost_amount || 0).toLocaleString('id-ID')}</td>
                                                    <td className={isProfitable ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                        {isProfitable ? "+" : ""}Rp {profit.toLocaleString('id-ID')}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${tx.document_status === "lengkap" ? 'bg-success' : 'bg-warning'}`}>
                                                            {tx.document_status === "lengkap" ? 'Lengkap' : 'Incomplete'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary text-uppercase">{tx.status || 'Validated'}</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
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
                                <nav className="d-flex justify-content-between align-items-center mt-4">
                                    <span className="text-muted small">
                                        Halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.totalPages}</strong> ({pagination.totalItems} transaksi)
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

            {/* Claim Details Modal Popup */}
            {selectedTx && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">Detail Klaim: {selectedTx.patient_name}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTx(null)}></button>
                            </div>
                            <div className="modal-body p-4 text-dark">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6 border-end">
                                        <h6 className="fw-bold text-secondary text-uppercase small">Diagnosis Primer</h6>
                                        {selectedTx.primary_diagnosis ? (
                                            <div className="p-2 bg-light rounded">
                                                <span className="badge bg-success me-2">{selectedTx.primary_diagnosis.icd10_code}</span>
                                                <strong>{selectedTx.primary_diagnosis.disease_name}</strong>
                                                <div className="text-muted small mt-1">{selectedTx.primary_diagnosis.doctor_diagnosis}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}

                                        <h6 className="fw-bold text-secondary text-uppercase small mt-3">Diagnosis Sekunder</h6>
                                        {selectedTx.secondary_diagnosis && selectedTx.secondary_diagnosis.length > 0 ? (
                                            <div className="d-flex flex-column gap-1">
                                                {selectedTx.secondary_diagnosis.map((d) => (
                                                    <div key={d.id} className="p-1 bg-light rounded text-dark small">
                                                        <span className="badge bg-secondary me-2">{d.icd10_code}</span>
                                                        {d.disease_name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted small">Tidak ada diagnosis sekunder</span>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-secondary text-uppercase small">Kelengkapan Berkas (Document Checklist)</h6>
                                        <ul className="list-group list-group-flush border rounded p-1 mb-3">
                                            <li className="list-group-item d-flex justify-content-between py-1 bg-transparent">
                                                <span>Resume Medis</span>
                                                <span>{selectedTx.document_checklist?.has_medical_resume ? "✅ Lengkap" : "❌ Tidak Ada"}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between py-1 bg-transparent">
                                                <span>Hasil Laboratorium</span>
                                                <span>{selectedTx.document_checklist?.has_lab_results ? "✅ Lengkap" : "❌ Tidak Ada"}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between py-1 bg-transparent">
                                                <span>Hasil Radiologi/Imaging</span>
                                                <span>{selectedTx.document_checklist?.has_imaging ? "✅ Lengkap" : "❌ Tidak Ada"}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between py-1 bg-transparent">
                                                <span>Konsultasi Spesialis</span>
                                                <span>{selectedTx.document_checklist?.has_specialist_consultation ? "✅ Lengkap" : "❌ Tidak Ada"}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between py-1 bg-transparent">
                                                <span>Terapi IV</span>
                                                <span>{selectedTx.document_checklist?.has_iv_therapy_proof ? "✅ Lengkap" : "❌ Tidak Ada"}</span>
                                            </li>
                                        </ul>
                                        <div className="small text-secondary">
                                            Severity Level: <strong>Lvl {selectedTx.document_checklist?.severity_level || 1}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-light rounded mb-3">
                                    <h6 className="fw-bold text-secondary text-uppercase small">Catatan Dokter</h6>
                                    <p className="mb-0 text-muted small">{selectedTx.notes || "Tidak ada catatan."}</p>
                                </div>

                                <div className="row g-2 text-center">
                                    <div className="col-4">
                                        <div className="border rounded p-2 bg-light">
                                            <span className="text-secondary small d-block">Claim Plafon</span>
                                            <strong className="text-success fs-6">Rp {parseFloat(selectedTx.coverage_amount || 0).toLocaleString('id-ID')}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border rounded p-2 bg-light">
                                            <span className="text-secondary small d-block">Hospital Cost</span>
                                            <strong className="text-danger fs-6">Rp {parseFloat(selectedTx.cost_amount || 0).toLocaleString('id-ID')}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className={`border rounded p-2 ${parseFloat(selectedTx.profit_amount) >= 0 ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'}`}>
                                            <span className="text-secondary small d-block">Profit/Loss</span>
                                            <strong className={`fs-6 ${parseFloat(selectedTx.profit_amount) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                Rp {parseFloat(selectedTx.profit_amount || 0).toLocaleString('id-ID')}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTx(null)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}