import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MasterINACBG() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Search & Sort
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    
    const [sortBy, setSortBy] = useState("inacbg");
    const [sortDesc, setSortDesc] = useState(false);

    // Custom Filters
    const [regionalFilter, setRegionalFilter] = useState("");
    const [kelasRawatFilter, setKelasRawatFilter] = useState("");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("view"); // view, create, edit
    const [selectedData, setSelectedData] = useState(null);

    const [formData, setFormData] = useState({
        inacbg: "",
        regional: "",
        kode_tariff: "",
        kelas_rawat: "",
        jenis_pelayanan: "",
        tariff_original: "",
        tariff: 0,
    });

    const API_URL = "https://manufacturing-trance-samba-stats.trycloudflare.com/api/v1";

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/inacbg`, {
                params: {
                    page,
                    limit,
                    search,
                    sortBy,
                    sortDesc,
                    regional: regionalFilter,
                    kelas_rawat: kelasRawatFilter
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.data) {
                setData(response.data.data.data || []);
                setTotalPages(response.data.data.totalPages || 1);
                setTotalData(response.data.data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire("Error", "Gagal mengambil data INA-CBG (Tarif)", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // debounce search
        return () => clearTimeout(timer);
    }, [page, limit, search, sortBy, sortDesc, regionalFilter, kelasRawatFilter]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDesc(!sortDesc);
        } else {
            setSortBy(field);
            setSortDesc(false);
        }
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedData(item);
        if (item && mode !== "create") {
            setFormData({
                inacbg: item.inacbg || "",
                regional: item.regional || "",
                kode_tariff: item.kode_tariff || "",
                kelas_rawat: item.kelas_rawat || "",
                jenis_pelayanan: item.jenis_pelayanan || "",
                tariff_original: item.tariff_original || "",
                tariff: item.tariff || 0,
            });
        } else {
            setFormData({
                inacbg: "",
                regional: "",
                kode_tariff: "",
                kelas_rawat: "",
                jenis_pelayanan: "",
                tariff_original: "",
                tariff: 0,
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (modalMode === "create") {
                await axios.post(`${API_URL}/inacbg`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("Sukses", "Data berhasil ditambahkan", "success");
            } else if (modalMode === "edit") {
                await axios.put(`${API_URL}/inacbg/${selectedData.inacbg}`, formData, {
                    params: {
                        regional: selectedData.regional,
                        kode_tariff: selectedData.kode_tariff,
                        kelas_rawat: selectedData.kelas_rawat
                    },
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("Sukses", "Data berhasil diperbarui", "success");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Save error:", error);
            Swal.fire("Error", error.response?.data?.error || "Gagal menyimpan data", "error");
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            text: `Anda yakin ingin menghapus data dengan kode ${item.inacbg}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!"
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_URL}/inacbg/${item.inacbg}`, {
                    params: {
                        regional: item.regional,
                        kode_tariff: item.kode_tariff,
                        kelas_rawat: item.kelas_rawat
                    },
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
                fetchData();
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Gagal Hapus", error.response?.data?.error || "Terjadi kesalahan saat menghapus data", "error");
            }
        }
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted ms-1" style={{fontSize: '0.7rem'}}></i>;
        return <i className={`bi bi-arrow-${sortDesc ? 'down' : 'up'} ms-1`} style={{fontSize: '0.7rem'}}></i>;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Master INA-CBG (Tarif)</h2>
                    <p className="text-muted mb-0">Kelola data master tarif INA-CBG</p>
                </div>
                <button className="btn btn-primary px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => openModal("create")}>
                    <i className="bi bi-plus-lg me-2"></i> Tambah Tarif
                </button>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                    <div className="row mb-3 gx-2 align-items-center">
                        <div className="col-auto d-flex align-items-center">
                            <span className="me-2 text-muted">Show</span>
                            <select 
                                className="form-select form-select-sm" 
                                style={{ width: "80px", borderRadius: "8px" }}
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="ms-2 text-muted">entries</span>
                        </div>
                        
                        <div className="col d-flex justify-content-end gap-2">
                            <div className="position-relative" style={{ width: "200px" }}>
                                <select 
                                    className="form-select form-select-sm" 
                                    style={{ borderRadius: "8px" }}
                                    value={regionalFilter}
                                    onChange={(e) => { setRegionalFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Semua Regional</option>
                                    <option value="reg1">Regional 1</option>
                                    <option value="reg2">Regional 2</option>
                                    <option value="reg3">Regional 3</option>
                                    <option value="reg4">Regional 4</option>
                                    <option value="reg5">Regional 5</option>
                                </select>
                            </div>
                            
                            <div className="position-relative" style={{ width: "150px" }}>
                                <select 
                                    className="form-select form-select-sm" 
                                    style={{ borderRadius: "8px" }}
                                    value={kelasRawatFilter}
                                    onChange={(e) => { setKelasRawatFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Semua Kelas</option>
                                    <option value="1">Kelas 1</option>
                                    <option value="2">Kelas 2</option>
                                    <option value="3">Kelas 3</option>
                                </select>
                            </div>

                            <div className="position-relative" style={{ width: "250px" }}>
                                <i className="bi bi-search position-absolute text-muted" style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}></i>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    placeholder="Cari Kode INA-CBG / RS..." 
                                    style={{ paddingLeft: "36px", borderRadius: "8px" }}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead style={{ backgroundColor: "#f8fafc" }}>
                                <tr>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('inacbg')}>
                                        Kode INA-CBG <SortIcon field="inacbg" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('kode_tariff')}>
                                        Kode RS <SortIcon field="kode_tariff" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('regional')}>
                                        Regional <SortIcon field="regional" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('kelas_rawat')}>
                                        Kelas <SortIcon field="kelas_rawat" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('jenis_pelayanan')}>
                                        Jenis <SortIcon field="jenis_pelayanan" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('tariff')}>
                                        Tarif Normal <SortIcon field="tariff" />
                                    </th>
                                    <th className="py-3 text-center" style={{ width: "15%" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">Data tidak ditemukan</td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="fw-semibold text-primary">{item.inacbg}</td>
                                            <td>{item.kode_tariff}</td>
                                            <td><span className="badge bg-secondary">{item.regional}</span></td>
                                            <td>Kelas {item.kelas_rawat}</td>
                                            <td>{item.jenis_pelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan'}</td>
                                            <td className="fw-semibold text-success">{formatCurrency(item.tariff)}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <button className="btn btn-sm btn-light text-primary" onClick={() => openModal("view", item)} title="View">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light text-warning" onClick={() => openModal("edit", item)} title="Edit">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(item)} title="Delete">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                            Menampilkan {data.length > 0 ? ((page - 1) * limit) + 1 : 0} - {((page - 1) * limit) + data.length} dari {totalData} data
                        </div>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)}>Sebelumnya</button>
                            </li>
                            <li className="page-item active">
                                <button className="page-link">{page}</button>
                            </li>
                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page + 1)}>Selanjutnya</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal CRUD */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        {modalMode === "create" && "Tambah Data Tarif INA-CBG"}
                        {modalMode === "edit" && "Edit Data Tarif INA-CBG"}
                        {modalMode === "view" && "Detail Data Tarif INA-CBG"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Kode INA-CBG</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.inacbg} 
                                        onChange={(e) => setFormData({...formData, inacbg: e.target.value})}
                                        disabled={modalMode !== "create"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Kode RS (Tariff)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.kode_tariff} 
                                        onChange={(e) => setFormData({...formData, kode_tariff: e.target.value})}
                                        disabled={modalMode !== "create"}
                                    />
                                </Form.Group>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Regional</Form.Label>
                                    <Form.Select 
                                        value={formData.regional}
                                        onChange={(e) => setFormData({...formData, regional: e.target.value})}
                                        disabled={modalMode !== "create"}
                                    >
                                        <option value="">Pilih Regional</option>
                                        <option value="reg1">Regional 1</option>
                                        <option value="reg2">Regional 2</option>
                                        <option value="reg3">Regional 3</option>
                                        <option value="reg4">Regional 4</option>
                                        <option value="reg5">Regional 5</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Kelas Rawat</Form.Label>
                                    <Form.Select 
                                        value={formData.kelas_rawat}
                                        onChange={(e) => setFormData({...formData, kelas_rawat: e.target.value})}
                                        disabled={modalMode !== "create"}
                                    >
                                        <option value="">Pilih Kelas</option>
                                        <option value="1">Kelas 1</option>
                                        <option value="2">Kelas 2</option>
                                        <option value="3">Kelas 3</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Jenis Pelayanan</Form.Label>
                                    <Form.Select 
                                        value={formData.jenis_pelayanan}
                                        onChange={(e) => setFormData({...formData, jenis_pelayanan: e.target.value})}
                                        disabled={modalMode === "view"}
                                    >
                                        <option value="">Pilih Jenis</option>
                                        <option value="1">Rawat Inap</option>
                                        <option value="2">Rawat Jalan</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Tarif Asli (Original String)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.tariff_original} 
                                        onChange={(e) => setFormData({...formData, tariff_original: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Tarif Nominal (Rp)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={formData.tariff} 
                                        onChange={(e) => setFormData({...formData, tariff: Number(e.target.value)})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {modalMode === "view" ? "Tutup" : "Batal"}
                    </Button>
                    {modalMode !== "view" && (
                        <Button variant="primary" onClick={handleSave}>
                            Simpan Data
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}
