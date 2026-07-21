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

    const colorMap = {
        primary: 'var(--sc-primary, #2563EB)',
        success: 'var(--sc-success, #22C55E)',
        warning: 'var(--sc-warning, #F59E0B)',
        danger: 'var(--sc-danger, #EF4444)',
        info: 'var(--sc-info, #06B6D4)',
    };

    return (

        <div
            className="sc-animate-in"
            style={{
                background: 'var(--sc-bg-card, #ffffff)',
                borderRadius: 'var(--sc-radius-lg, 12px)',
                boxShadow: 'var(--sc-shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
                border: '1px solid var(--sc-border, #e5e7eb)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >

            {/* Section Header */}
            <div
                className="sc-section-header"
                style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--sc-border, #e5e7eb)',
                }}
            >
                <h5
                    style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'var(--sc-text-primary, #111827)',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Activity Timeline
                </h5>
            </div>

            {/* Timeline Body */}
            <div style={{ padding: '24px', flex: 1 }}>

                {
                    activities.map((item, index) => {

                        const accent = colorMap[item.color] || colorMap.primary;
                        const isLast = index === activities.length - 1;

                        return (
                            <div
                                key={index}
                                className={`sc-stagger-${index + 1}`}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    position: 'relative',
                                    paddingBottom: isLast ? 0 : '24px',
                                }}
                            >

                                {/* Icon Column with Connector Line */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* Icon Circle */}
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: `${accent}14`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <i
                                            className={`bi ${item.icon}`}
                                            style={{
                                                fontSize: '16px',
                                                color: accent,
                                            }}
                                        ></i>
                                    </div>

                                    {/* Vertical Connector Line */}
                                    {!isLast && (
                                        <div
                                            style={{
                                                width: '2px',
                                                flex: 1,
                                                background: 'var(--sc-border, #e5e7eb)',
                                                marginTop: '6px',
                                                borderRadius: '1px',
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>

                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--sc-text-primary, #111827)',
                                            marginBottom: '4px',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {item.title}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: '13px',
                                            color: 'var(--sc-text-muted, #9ca3af)',
                                            marginBottom: '4px',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {item.desc}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--sc-text-secondary, #6b7280)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.time}
                                    </div>

                                </div>

                            </div>
                        );
                    })
                }

            </div>

        </div>

    );

}