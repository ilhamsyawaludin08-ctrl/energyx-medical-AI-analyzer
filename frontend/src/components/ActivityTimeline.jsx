export default function ActivityTimeline() {

    const activities = [
        {
            icon: "bi-person-check-fill",
            color: "success",
            title: "Analisis Baru",
            desc: "Pasien Ahmad berhasil dianalisis AI.",
            time: "5 menit lalu"
        },
        {
            icon: "bi-exclamation-triangle-fill",
            color: "warning",
            title: "Risk Warning",
            desc: "1 klaim memiliki risiko tinggi.",
            time: "15 menit lalu"
        },
        {
            icon: "bi-file-earmark-check-fill",
            color: "primary",
            title: "Claim Approved",
            desc: "BPJS menyetujui klaim pasien Siti.",
            time: "30 menit lalu"
        },
        {
            icon: "bi-x-circle-fill",
            color: "danger",
            title: "Claim Rejected",
            desc: "Diagnosis tidak sesuai SOAP.",
            time: "1 jam lalu"
        }
    ];

    return (

        <div className="card shadow-sm border-0 h-100">

            <div className="card-header bg-white">

                <h5 className="mb-0">
                    Activity Timeline
                </h5>

            </div>

            <div className="card-body">

                {
                    activities.map((item, index) => (

                        <div
                            key={index}
                            className="d-flex mb-4"
                        >

                            <div className={`text-${item.color} fs-4 me-3`}>

                                <i className={`bi ${item.icon}`}></i>

                            </div>

                            <div>

                                <strong>{item.title}</strong>

                                <div className="text-muted small">

                                    {item.desc}

                                </div>

                                <small className="text-secondary">

                                    {item.time}

                                </small>

                            </div>

                        </div>

                    ))
                }

            </div>

        </div>

    );

}