import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ApprovalChart from "../components/charts/ApprovalChart";
import ActivityTimeline from "../components/ActivityTimeline";
import HighRiskClaims from "../components/HighRiskClaims";
import StatCard from "../components/StatCard";

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalClaims: 0,
        approvalRate: "100%",
        pendingReview: 0,
        highRiskClaims: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get("/transactions?limit=10");
                if (response.data && response.data.data) {
                    const txs = response.data.data;
                    setRecentTransactions(txs.slice(0, 5));

                    // Compute dynamic stats based on transactions list
                    const total = txs.length;
                    const completeTxs = txs.filter(t => t.status === "selesai" || t.status === "approved");
                    const rate = total > 0 ? Math.round((completeTxs.length / total) * 100) + "%" : "100%";
                    
                    // High risk = incomplete documentation status
                    const highRiskCount = txs.filter(t => t.document_status === "tidak lengkap").length;

                    // Pending review = dummy count or items requiring verification
                    const pendingCount = txs.filter(t => t.status === "pending").length || 3;

                    setStats({
                        totalClaims: total,
                        approvalRate: rate,
                        pendingReview: pendingCount,
                        highRiskClaims: highRiskCount,
                    });
                }
            } catch (err) {
                console.error("Failed to load dashboard statistics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="container-fluid" style={{ background: "#f8fafc" }}>
            {/* Page Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold mb-1 text-primary">Dashboard</h2>
                    <p className="text-muted mb-0">Overview klaim BPJS dan analisis risiko waktu-nyata.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("/analysis")}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Analisis Baru
                </button>
            </div>

            {/* Stats Summary row */}
            <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                    <StatCard
                        title="Total Claims"
                        value={loading ? "..." : stats.totalClaims}
                        subtitle="Klaim tercatat"
                        icon="bi-file-earmark-medical"
                        color="primary"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <StatCard
                        title="Approval Rate"
                        value={loading ? "..." : stats.approvalRate}
                        subtitle="Tingkat persetujuan"
                        icon="bi-check-circle"
                        color="success"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <StatCard
                        title="Pending Review"
                        value={loading ? "..." : stats.pendingReview}
                        subtitle="Perlu validasi"
                        icon="bi-clock-history"
                        color="warning"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <StatCard
                        title="High Risk Claims"
                        value={loading ? "..." : stats.highRiskClaims}
                        subtitle="Dokumen tidak lengkap"
                        icon="bi-exclamation-triangle"
                        color="danger"
                    />
                </div>
            </div>

            {/* Quick Actions & Risk Alerts */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Quick Actions</h5>
                        </div>
                        <div className="card-body d-flex gap-3 flex-wrap align-items-center">
                            <button className="btn btn-primary py-2 px-3" onClick={() => navigate("/analysis")}>
                                <i className="bi bi-plus-circle me-2"></i>
                                Buat Analisis Baru
                            </button>

                            <button className="btn btn-outline-success py-2 px-3" onClick={() => navigate("/diagnosis")}>
                                <i className="bi bi-clipboard2-pulse me-2"></i>
                                Review Klaim / Validasi
                            </button>

                            <button className="btn btn-outline-dark py-2 px-3" onClick={() => navigate("/transactions")}>
                                <i className="bi bi-file-earmark-medical me-2"></i>
                                Lihat Transaksi Klaim
                            </button>
                            
                            <button className="btn btn-outline-secondary py-2 px-3" onClick={() => navigate("/encounters")}>
                                <i className="bi bi-person-lines-fill me-2"></i>
                                Kelola Kunjungan (Encounters)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-danger text-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-exclamation-octagon me-2"></i>Risk Alert</h5>
                        </div>
                        <div className="card-body">
                            {stats.highRiskClaims > 0 ? (
                                <>
                                    <p className="mb-2 fw-semibold text-danger">
                                        ⚠️ {stats.highRiskClaims} klaim terdeteksi memiliki risiko penolakan tinggi.
                                    </p>
                                    <p className="mb-0 text-muted small">
                                        Ada berkas klaim yang diajukan tanpa kelengkapan berkas yang diwajibkan oleh tingkat keparahan (Severity Level). Harap lakukan validasi ulang.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="mb-2 fw-semibold text-success">
                                        ✅ Semua berkas klaim terisi lengkap!
                                    </p>
                                    <p className="mb-0 text-muted small">
                                        Sistem tidak mendeteksi adanya linkage error atau kelalaian berkas pada riwayat klaim terbaru Anda.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart + Recent Transactions */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Claim Approval Trend</h5>
                        </div>
                        <div className="card-body">
                            <ApprovalChart />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Recent Transactions</h5>
                        </div>
                        <div className="card-body">
                            {recentTransactions.length === 0 ? (
                                <p className="text-muted small">Belum ada transaksi klaim terbaru.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {recentTransactions.map((tx) => (
                                        <li key={tx.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                            <div>
                                                <span className="fw-bold text-dark d-block">{tx.patient_name}</span>
                                                <small className="text-muted">{new Date(tx.created_at || Date.now()).toLocaleDateString('id-ID')}</small>
                                            </div>
                                            <span className={`badge ${tx.document_status === "lengkap" ? 'bg-success' : 'bg-warning'}`}>
                                                {tx.document_status === "lengkap" ? 'Lengkap' : 'Tidak Lengkap'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline & Mock Component list */}
            <div className="row g-4">
                <div className="col-lg-6">
                    <ActivityTimeline />
                </div>
                <div className="col-lg-6">
                    <HighRiskClaims />
                </div>
            </div>
        </div>
    );
}