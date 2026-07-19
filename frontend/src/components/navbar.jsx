export default function Navbar() {
    return (
        <div
            className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center"
        >
            <div>

                <h4 className="mb-0 fw-bold">
                    BPJS Claim Prevention System
                </h4>

                <small className="text-muted">
                    AI Assisted Medical Validation
                </small>

            </div>

            <div className="d-flex align-items-center gap-4">

                <i
                    className="bi bi-bell fs-4"
                    style={{ cursor: "pointer" }}
                ></i>

                <div className="d-flex align-items-center">

                    <div
                        className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2"
                        style={{
                            width: 40,
                            height: 40,
                        }}
                    >
                        A
                    </div>

                    <div>

                        <div className="fw-semibold">
                            Admin
                        </div>

                        <small className="text-muted">
                            Doctor
                        </small>

                    </div>

                </div>

            </div>
        </div>
    );
}