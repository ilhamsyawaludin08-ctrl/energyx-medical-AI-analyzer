export default function HighRiskClaims() {

    const data = [

        {
            patient: "Budi",
            score: 42
        },

        {
            patient: "Andi",
            score: 58
        },

        {
            patient: "Rina",
            score: 30
        }

    ];

    const getScoreColor = (score) => {
        if (score >= 50) return 'var(--sc-danger, #EF4444)';
        if (score >= 35) return 'var(--sc-warning, #F59E0B)';
        return 'var(--sc-success, #22C55E)';
    };

    const getScoreLabel = (score) => {
        if (score >= 50) return 'High';
        if (score >= 35) return 'Medium';
        return 'Low';
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
                    High Risk Claims
                </h5>
            </div>

            {/* Claims Body */}
            <div style={{ padding: '24px', flex: 1 }}>

                {

                    data.map((item, index) => {

                        const barColor = getScoreColor(item.score);
                        const isLast = index === data.length - 1;

                        return (
                            <div
                                key={index}
                                className={`sc-stagger-${index + 1}`}
                                style={{
                                    marginBottom: isLast ? 0 : '20px',
                                }}
                            >

                                {/* Patient Name + Score Pill */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '10px',
                                    }}
                                >

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <i
                                            className="bi bi-person-fill"
                                            style={{
                                                fontSize: '14px',
                                                color: 'var(--sc-text-muted, #9ca3af)',
                                            }}
                                        ></i>
                                        <span
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: 'var(--sc-text-primary, #111827)',
                                            }}
                                        >
                                            {item.patient}
                                        </span>
                                    </div>

                                    {/* Score Pill */}
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '3px 10px',
                                            borderRadius: 'var(--sc-radius-pill, 999px)',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: `${barColor}14`,
                                            color: barColor,
                                        }}
                                    >
                                        {item.score}% · {getScoreLabel(item.score)}
                                    </span>

                                </div>

                                {/* Progress Bar */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        borderRadius: 'var(--sc-radius-pill, 999px)',
                                        background: 'var(--sc-border, #e5e7eb)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${item.score}%`,
                                            height: '100%',
                                            borderRadius: 'var(--sc-radius-pill, 999px)',
                                            background: barColor,
                                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    ></div>
                                </div>

                            </div>
                        );

                    })

                }

            </div>

        </div>

    );

}