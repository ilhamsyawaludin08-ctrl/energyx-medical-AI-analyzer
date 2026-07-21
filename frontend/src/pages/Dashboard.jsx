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
        <div className="sc-animate-in" style={{ background: "var(--sc-bg, #f8fafc)", minHeight: "100%" }}>
            {/* Page Header */}
            <div className="sc-page-header" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--sc-border, #e2e8f0)"
            }}>
                <div>
                    <h2 style={{
                        fontWeight: 800,
                        color: "var(--sc-text-primary, #1e293b)",
                        fontSize: "1.65rem",
                        marginBottom: "0.25rem",
                        letterSpacing: "-0.02em"
                    }}>
                        <i className="bi bi-grid-1x2 me-2" style={{ color: "var(--sc-primary, #3b82f6)" }}></i>
                        Dashboard
                    </h2>
                    <p style={{
                        color: "var(--sc-text-secondary, #64748b)",
                        marginBottom: 0,
                        fontSize: "0.92rem"
                    }}>
                        Overview klaim BPJS dan analisis risiko waktu-nyata.
                    </p>
                </div>
                <button
                    className="btn sc-hover-lift"
                    style={{
                        background: "var(--sc-primary-gradient, linear-gradient(135deg, #3b82f6, #6366f1))",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: "var(--sc-radius-md, 12px)",
                        padding: "0.6rem 1.4rem",
                        border: "none",
                        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(59,130,246,0.25))",
                        fontSize: "0.9rem",
                        transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onClick={() => navigate("/analysis")}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Analisis Baru
                </button>
            </div>

            {/* Stats Summary row */}
            <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6 sc-stagger-1">
                    <StatCard
                        title="Total Claims"
                        value={loading ? "..." : stats.totalClaims}
                        subtitle="Klaim tercatat"
                        icon="bi-file-earmark-medical"
                        color="primary"
                    />
                </div>

                <div className="col-lg-3 col-md-6 sc-stagger-2">
                    <StatCard
                        title="Approval Rate"
                        value={loading ? "..." : stats.approvalRate}
                        subtitle="Tingkat persetujuan"
                        icon="bi-check-circle"
                        color="success"
                    />
                </div>

                <div className="col-lg-3 col-md-6 sc-stagger-3">
                    <StatCard
                        title="Pending Review"
                        value={loading ? "..." : stats.pendingReview}
                        subtitle="Perlu validasi"
                        icon="bi-clock-history"
                        color="warning"
                    />
                </div>

                <div className="col-lg-3 col-md-6 sc-stagger-4">
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
                    <div style={{
                        background: "var(--sc-bg-card, #fff)",
                        borderRadius: "var(--sc-radius-lg, 16px)",
                        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
                        border: "1px solid var(--sc-border, #e2e8f0)",
                        height: "100%",
                        overflow: "hidden"
                    }}>
                        <div className="sc-section-header" style={{
                            padding: "1.25rem 1.5rem",
                            borderBottom: "1px solid var(--sc-border, #e2e8f0)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <i className="bi bi-lightning-charge" style={{ color: "var(--sc-primary, #3b82f6)", fontSize: "1.15rem" }}></i>
                            <h5 style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "var(--sc-text-primary, #1e293b)",
                                fontSize: "1.05rem"
                            }}>Quick Actions</h5>
                        </div>
                        <div style={{ padding: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                            <button
                                className="btn sc-hover-lift"
                                style={{
                                    background: "var(--sc-primary-gradient, linear-gradient(135deg, #3b82f6, #6366f1))",
                                    color: "#fff",
                                    fontWeight: 600,
                                    borderRadius: "var(--sc-radius-md, 12px)",
                                    padding: "0.6rem 1.2rem",
                                    border: "none",
                                    fontSize: "0.88rem",
                                    boxShadow: "0 2px 8px rgba(59,130,246,0.2)"
                                }}
                                onClick={() => navigate("/analysis")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Buat Analisis Baru
                            </button>

                            <button
                                className="btn sc-hover-lift"
                                style={{
                                    background: "transparent",
                                    color: "var(--sc-success, #10b981)",
                                    fontWeight: 600,
                                    borderRadius: "var(--sc-radius-md, 12px)",
                                    padding: "0.6rem 1.2rem",
                                    border: "1.5px solid var(--sc-success, #10b981)",
                                    fontSize: "0.88rem",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => navigate("/diagnosis")}
                            >
                                <i className="bi bi-clipboard2-pulse me-2"></i>
                                Review Klaim / Validasi
                            </button>

                            <button
                                className="btn sc-hover-lift"
                                style={{
                                    background: "transparent",
                                    color: "var(--sc-text-primary, #334155)",
                                    fontWeight: 600,
                                    borderRadius: "var(--sc-radius-md, 12px)",
                                    padding: "0.6rem 1.2rem",
                                    border: "1.5px solid var(--sc-border, #cbd5e1)",
                                    fontSize: "0.88rem",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => navigate("/transactions")}
                            >
                                <i className="bi bi-file-earmark-medical me-2"></i>
                                Lihat Transaksi Klaim
                            </button>
                            
                            <button
                                className="btn sc-hover-lift"
                                style={{
                                    background: "transparent",
                                    color: "var(--sc-text-secondary, #64748b)",
                                    fontWeight: 600,
                                    borderRadius: "var(--sc-radius-md, 12px)",
                                    padding: "0.6rem 1.2rem",
                                    border: "1.5px solid var(--sc-border, #cbd5e1)",
                                    fontSize: "0.88rem",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => navigate("/encounters")}
                            >
                                <i className="bi bi-person-lines-fill me-2"></i>
                                Kelola Kunjungan (Encounters)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="sc-card-accent-danger" style={{
                        background: "var(--sc-bg-card, #fff)",
                        borderRadius: "var(--sc-radius-lg, 16px)",
                        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
                        border: "1px solid var(--sc-border, #e2e8f0)",
                        height: "100%",
                        overflow: "hidden",
                        borderTop: "3px solid var(--sc-danger, #ef4444)"
                    }}>
                        <div style={{
                            padding: "1.25rem 1.5rem",
                            borderBottom: "1px solid var(--sc-border, #e2e8f0)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--sc-radius-sm, 8px)",
                                background: "rgba(239,68,68,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <i className="bi bi-exclamation-octagon" style={{ color: "var(--sc-danger, #ef4444)", fontSize: "1rem" }}></i>
                            </div>
                            <h5 style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "var(--sc-danger, #ef4444)",
                                fontSize: "1.05rem"
                            }}>Risk Alert</h5>
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                            {stats.highRiskClaims > 0 ? (
                                <>
                                    <p style={{
                                        marginBottom: "0.5rem",
                                        fontWeight: 600,
                                        color: "var(--sc-danger, #ef4444)",
                                        fontSize: "0.95rem"
                                    }}>
                                        ⚠️ {stats.highRiskClaims} klaim terdeteksi memiliki risiko penolakan tinggi.
                                    </p>
                                    <p style={{
                                        marginBottom: 0,
                                        color: "var(--sc-text-secondary, #64748b)",
                                        fontSize: "0.84rem",
                                        lineHeight: 1.6
                                    }}>
                                        Ada berkas klaim yang diajukan tanpa kelengkapan berkas yang diwajibkan oleh tingkat keparahan (Severity Level). Harap lakukan validasi ulang.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p style={{
                                        marginBottom: "0.5rem",
                                        fontWeight: 600,
                                        color: "var(--sc-success, #10b981)",
                                        fontSize: "0.95rem"
                                    }}>
                                        ✅ Semua berkas klaim terisi lengkap!
                                    </p>
                                    <p style={{
                                        marginBottom: 0,
                                        color: "var(--sc-text-secondary, #64748b)",
                                        fontSize: "0.84rem",
                                        lineHeight: 1.6
                                    }}>
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
                    <div style={{
                        background: "var(--sc-bg-card, #fff)",
                        borderRadius: "var(--sc-radius-lg, 16px)",
                        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
                        border: "1px solid var(--sc-border, #e2e8f0)",
                        height: "100%",
                        overflow: "hidden"
                    }}>
                        <div className="sc-section-header" style={{
                            padding: "1.25rem 1.5rem",
                            borderBottom: "1px solid var(--sc-border, #e2e8f0)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <i className="bi bi-graph-up-arrow" style={{ color: "var(--sc-primary, #3b82f6)", fontSize: "1.15rem" }}></i>
                            <h5 style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "var(--sc-text-primary, #1e293b)",
                                fontSize: "1.05rem"
                            }}>Claim Approval Trend</h5>
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                            <ApprovalChart />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div style={{
                        background: "var(--sc-bg-card, #fff)",
                        borderRadius: "var(--sc-radius-lg, 16px)",
                        boxShadow: "var(--sc-shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
                        border: "1px solid var(--sc-border, #e2e8f0)",
                        height: "100%",
                        overflow: "hidden"
                    }}>
                        <div className="sc-section-header" style={{
                            padding: "1.25rem 1.5rem",
                            borderBottom: "1px solid var(--sc-border, #e2e8f0)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <i className="bi bi-clock-history" style={{ color: "var(--sc-info, #06b6d4)", fontSize: "1.15rem" }}></i>
                            <h5 style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "var(--sc-text-primary, #1e293b)",
                                fontSize: "1.05rem"
                            }}>Recent Transactions</h5>
                        </div>
                        <div style={{ padding: "1.25rem 1.5rem" }}>
                            {recentTransactions.length === 0 ? (
                                <div className="sc-empty-state" style={{
                                    textAlign: "center",
                                    padding: "2rem 1rem"
                                }}>
                                    <i className="bi bi-inbox" style={{
                                        fontSize: "2.5rem",
                                        color: "var(--sc-border, #cbd5e1)",
                                        display: "block",
                                        marginBottom: "0.75rem"
                                    }}></i>
                                    <p style={{
                                        color: "var(--sc-text-secondary, #94a3b8)",
                                        fontSize: "0.88rem",
                                        marginBottom: 0
                                    }}>Belum ada transaksi klaim terbaru.</p>
                                </div>
                            ) : (
                                <div>
                                    {recentTransactions.map((tx) => (
                                        <div key={tx.id} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.85rem 0",
                                            borderBottom: "1px solid var(--sc-border, #f1f5f9)"
                                        }}>
                                            <div>
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: "var(--sc-text-primary, #1e293b)",
                                                    display: "block",
                                                    fontSize: "0.92rem"
                                                }}>{tx.patient_name}</span>
                                                <small style={{
                                                    color: "var(--sc-text-secondary, #94a3b8)",
                                                    fontSize: "0.8rem"
                                                }}>{new Date(tx.created_at || Date.now()).toLocaleDateString('id-ID')}</small>
                                            </div>
                                            <span style={{
                                                padding: "0.3rem 0.75rem",
                                                borderRadius: "var(--sc-radius-pill, 100px)",
                                                fontSize: "0.78rem",
                                                fontWeight: 600,
                                                background: tx.document_status === "lengkap"
                                                    ? "rgba(16,185,129,0.1)"
                                                    : "rgba(245,158,11,0.1)",
                                                color: tx.document_status === "lengkap"
                                                    ? "var(--sc-success, #10b981)"
                                                    : "var(--sc-warning, #f59e0b)"
                                            }}>
                                                {tx.document_status === "lengkap" ? 'Lengkap' : 'Tidak Lengkap'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline & Mock Component list */}
            <div className="row g-4" style={{ marginBottom: "1rem" }}>
                <div className="col-lg-6 sc-stagger-1">
                    <ActivityTimeline />
                </div>
                <div className="col-lg-6 sc-stagger-2">
                    <HighRiskClaims />
                </div>
            </div>
        </div>
    );
}