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
        <div className="sc-animate-in" style={{ padding: '0' }}>
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
                            <i className="bi bi-person-lines-fill"></i>
                        </span>
                        Encounters
                    </h2>
                    <p style={{
                        color: 'var(--sc-text-muted)',
                        margin: 0,
                        fontSize: '0.9rem',
                        paddingLeft: '3.25rem'
                    }}>
                        Kelola dan tinjau seluruh riwayat kunjungan pasien yang terdaftar di rumah sakit.
                    </p>
                </div>
                <button
                    className="sc-hover-lift"
                    onClick={() => navigate("/analysis")}
                    style={{
                        background: 'var(--sc-primary-gradient)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 'var(--sc-radius-md)',
                        padding: '0.625rem 1.5rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--sc-shadow-sm)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <i className="bi bi-plus-circle"></i>
                    Buat Analisis Baru
                </button>
            </div>

            {/* Search Bar Card */}
            <div className="sc-animate-in sc-stagger-1" style={{
                background: 'var(--sc-bg-card)',
                borderRadius: 'var(--sc-radius-lg)',
                border: '1px solid var(--sc-border)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                boxShadow: 'var(--sc-shadow-xs)'
            }}>
                <label style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--sc-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                    display: 'block'
                }}>
                    Pencarian Pasien / Encounter
                </label>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--sc-bg)',
                    borderRadius: 'var(--sc-radius-md)',
                    border: '1px solid var(--sc-border)',
                    padding: '0 1rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}>
                    <i className="bi bi-search" style={{ color: 'var(--sc-text-muted)', fontSize: '1rem' }}></i>
                    <input
                        type="text"
                        placeholder="Cari nama pasien, nomor RM, atau encounter..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            padding: '0.75rem 0.75rem',
                            fontSize: '0.9rem',
                            color: 'var(--sc-text-primary)',
                            width: '100%'
                        }}
                    />
                </div>
            </div>

            {/* Encounters Table Card */}
            <div className="sc-animate-in sc-stagger-2" style={{
                background: 'var(--sc-bg-card)',
                borderRadius: 'var(--sc-radius-lg)',
                border: '1px solid var(--sc-border)',
                boxShadow: 'var(--sc-shadow-sm)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem'
                    }}>
                        <div className="spinner-border" role="status" style={{ color: 'var(--sc-primary)', width: '2.5rem', height: '2.5rem' }}></div>
                        <p style={{ marginTop: '1rem', color: 'var(--sc-text-muted)', fontSize: '0.9rem' }}>Memuat data kunjungan...</p>
                    </div>
                ) : encounters.length === 0 ? (
                    <div className="sc-empty-state" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem'
                    }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: 'var(--sc-radius-xl)',
                            background: 'var(--sc-bg)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <i className="bi bi-folder-x" style={{ fontSize: '2rem', color: 'var(--sc-text-muted)' }}></i>
                        </div>
                        <p style={{ color: 'var(--sc-text-muted)', margin: 0, fontSize: '0.95rem' }}>
                            Data kunjungan tidak ditemukan.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.875rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'var(--sc-bg)',
                                        borderBottom: '2px solid var(--sc-border)'
                                    }}>
                                        {['Pasien', 'No. RM', 'No. Encounter', 'Layanan', 'Diagnosis SOAP', 'Tanggal Masuk', ''].map((h, i) => (
                                            <th key={i} style={{
                                                padding: '0.875rem 1.25rem',
                                                fontWeight: '600',
                                                color: 'var(--sc-text-secondary)',
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem',
                                                letterSpacing: '0.06em',
                                                whiteSpace: 'nowrap',
                                                textAlign: i === 6 ? 'right' : 'left'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {encounters.map((enc, idx) => (
                                        <tr
                                            key={enc.id}
                                            className="sc-hover-lift"
                                            style={{
                                                borderBottom: '1px solid var(--sc-border)',
                                                background: idx % 2 === 0 ? 'var(--sc-bg-card)' : 'var(--sc-bg)',
                                                transition: 'background 0.15s ease',
                                                cursor: 'default'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--sc-primary-rgb, 99,102,241), 0.04)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--sc-bg-card)' : 'var(--sc-bg)'}
                                        >
                                            <td style={{ padding: '0.875rem 1.25rem' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--sc-text-primary)', marginBottom: '0.125rem' }}>
                                                    {enc.patient_name}
                                                </div>
                                                <small style={{ color: 'var(--sc-text-muted)', fontSize: '0.75rem' }}>
                                                    {enc.gender === "Laki-laki" || enc.gender === "L" || enc.gender === "Male" ? "Laki-laki" : "Perempuan"} | {enc.age} Th
                                                </small>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.25rem' }}>
                                                <code style={{
                                                    background: 'var(--sc-bg)',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: 'var(--sc-radius-sm)',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--sc-primary)',
                                                    border: '1px solid var(--sc-border)'
                                                }}>
                                                    {enc.patient_id}
                                                </code>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.25rem' }}>
                                                <code style={{
                                                    background: 'var(--sc-bg)',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: 'var(--sc-radius-sm)',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--sc-primary)',
                                                    border: '1px solid var(--sc-border)'
                                                }}>
                                                    {enc.encounter_number}
                                                </code>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.25rem' }}>
                                                <span className={enc.service_type === "Rawat Inap" ? "sc-pill-info" : "sc-pill-secondary"} style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: 'var(--sc-radius-pill)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {enc.service_type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.25rem' }}>
                                                <div style={{
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    color: 'var(--sc-text-secondary)',
                                                    fontSize: '0.85rem'
                                                }} title={enc.assesment}>
                                                    {enc.assesment || "—"}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '0.875rem 1.25rem',
                                                color: 'var(--sc-text-secondary)',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.85rem'
                                            }}>
                                                {new Date(enc.created_at || Date.now()).toLocaleDateString('id-ID')}
                                            </td>
                                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                                                <button
                                                    className="sc-hover-lift"
                                                    onClick={() => navigate("/diagnosis", { state: { encounterNumber: enc.encounter_number } })}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--sc-primary)',
                                                        color: 'var(--sc-primary)',
                                                        borderRadius: 'var(--sc-radius-md)',
                                                        padding: '0.4rem 0.9rem',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'var(--sc-primary)';
                                                        e.currentTarget.style.color = '#fff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'var(--sc-primary)';
                                                    }}
                                                >
                                                    <i className="bi bi-shield-check"></i>
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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid var(--sc-border)',
                                flexWrap: 'wrap',
                                gap: '0.75rem'
                            }}>
                                <span style={{ color: 'var(--sc-text-muted)', fontSize: '0.8rem' }}>
                                    Menampilkan halaman <strong style={{ color: 'var(--sc-text-primary)' }}>{pagination.currentPage}</strong> dari <strong style={{ color: 'var(--sc-text-primary)' }}>{pagination.totalPages}</strong> ({pagination.totalRecords} records)
                                </span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        style={{
                                            padding: '0.4rem 0.85rem',
                                            border: '1px solid var(--sc-border)',
                                            borderRadius: 'var(--sc-radius-md)',
                                            background: pagination.currentPage === 1 ? 'var(--sc-bg)' : 'var(--sc-bg-card)',
                                            color: pagination.currentPage === 1 ? 'var(--sc-text-muted)' : 'var(--sc-text-primary)',
                                            cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        Sebelumnya
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                border: pagination.currentPage === page ? '1px solid var(--sc-primary)' : '1px solid var(--sc-border)',
                                                borderRadius: 'var(--sc-radius-md)',
                                                background: pagination.currentPage === page ? 'var(--sc-primary)' : 'var(--sc-bg-card)',
                                                color: pagination.currentPage === page ? '#fff' : 'var(--sc-text-primary)',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: pagination.currentPage === page ? '600' : '400',
                                                transition: 'all 0.15s ease',
                                                minWidth: '36px'
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        style={{
                                            padding: '0.4rem 0.85rem',
                                            border: '1px solid var(--sc-border)',
                                            borderRadius: 'var(--sc-radius-md)',
                                            background: pagination.currentPage === pagination.totalPages ? 'var(--sc-bg)' : 'var(--sc-bg-card)',
                                            color: pagination.currentPage === pagination.totalPages ? 'var(--sc-text-muted)' : 'var(--sc-text-primary)',
                                            cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}