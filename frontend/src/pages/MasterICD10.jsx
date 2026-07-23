import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MasterICD10() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Search & Sort
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    
    const [sortBy, setSortBy] = useState("code");
    const [sortDesc, setSortDesc] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("view"); // view, create, edit
    const [selectedData, setSelectedData] = useState(null);

    const [formData, setFormData] = useState({
        code: "",
        str: "",
        str_indo: "",
        chapter: "",
        severity: "",
        cbg_use_ind: "",
        tty: "",
        sab: "",
        cui: ""
    });

    const API_URL = "http://localhost:3000/api/v1";

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mrconso`, {
                params: {
                    page,
                    limit,
                    search,
                    sortBy,
                    sortDesc
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
            Swal.fire("Error", "Gagal mengambil data ICD-10", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // debounce search
        return () => clearTimeout(timer);
    }, [page, limit, search, sortBy, sortDesc]);

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
                code: item.code || "",
                str: item.str || "",
                str_indo: item.str_indo || "",
                chapter: item.chapter || "",
                severity: item.severity || "",
                cbg_use_ind: item.cbg_use_ind || "",
                tty: item.tty || "",
                sab: item.sab || "",
                cui: item.cui || ""
            });
        } else {
            setFormData({
                code: "",
                str: "",
                str_indo: "",
                chapter: "",
                severity: "",
                cbg_use_ind: "",
                tty: "",
                sab: "",
                cui: ""
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (modalMode === "create") {
                await axios.post(`${API_URL}/mrconso`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("Sukses", "Data berhasil ditambahkan", "success");
            } else if (modalMode === "edit") {
                await axios.put(`${API_URL}/mrconso/${selectedData.code}`, formData, {
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

    const handleDelete = async (code) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            text: `Anda yakin ingin menghapus data dengan kode ${code}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!"
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_URL}/mrconso/${code}`, {
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

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Master ICD-10</h2>
                    <p className="text-muted mb-0">Kelola data master diagnosis (ICD-10/ICD-9)</p>
                </div>
                <button className="btn btn-primary px-4 py-2" style={{ borderRadius: "8px" }} onClick={() => openModal("create")}>
                    <i className="bi bi-plus-lg me-2"></i> Tambah ICD
                </button>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
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
                        <div className="position-relative" style={{ width: "300px" }}>
                            <i className="bi bi-search position-absolute text-muted" style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}></i>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Cari Kode, Deskripsi..." 
                                style={{ paddingLeft: "36px", borderRadius: "8px" }}
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead style={{ backgroundColor: "#f8fafc" }}>
                                <tr>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                                        Kode <SortIcon field="code" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('str')}>
                                        Deskripsi <SortIcon field="str" />
                                    </th>
                                    <th className="py-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('chapter')}>
                                        Chapter <SortIcon field="chapter" />
                                    </th>
                                    <th className="py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">Data tidak ditemukan</td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="fw-semibold text-primary">{item.code}</td>
                                            <td>
                                                <div className="text-dark">{item.str}</div>
                                                {item.str_indo && <small className="text-muted">{item.str_indo}</small>}
                                            </td>
                                            <td>{item.chapter || '-'}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-light text-primary" onClick={() => openModal("view", item)} title="View">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light text-warning" onClick={() => openModal("edit", item)} title="Edit">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(item.code)} title="Delete">
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
                        {modalMode === "create" && "Tambah Data ICD"}
                        {modalMode === "edit" && "Edit Data ICD"}
                        {modalMode === "view" && "Detail Data ICD"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Kode</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.code} 
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                        disabled={modalMode !== "create"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Chapter</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.chapter} 
                                        onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Deskripsi</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2}
                                        value={formData.str} 
                                        onChange={(e) => setFormData({...formData, str: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Deskripsi (Indonesia)</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2}
                                        value={formData.str_indo} 
                                        onChange={(e) => setFormData({...formData, str_indo: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Severity</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.severity} 
                                        onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">CBG Use Ind</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.cbg_use_ind} 
                                        onChange={(e) => setFormData({...formData, cbg_use_ind: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">TTY</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.tty} 
                                        onChange={(e) => setFormData({...formData, tty: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">SAB</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.sab} 
                                        onChange={(e) => setFormData({...formData, sab: e.target.value})}
                                        disabled={modalMode === "view"}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">CUI</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.cui} 
                                        onChange={(e) => setFormData({...formData, cui: e.target.value})}
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
