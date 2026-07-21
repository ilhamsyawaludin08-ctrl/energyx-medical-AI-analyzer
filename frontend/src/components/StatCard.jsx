export default function StatCard({
    title,
    value,
    icon,
    color = "primary",
    subtitle
}) {

    const colorMap = {
        primary: 'var(--sc-primary, #2563EB)',
        success: 'var(--sc-success, #22C55E)',
        warning: 'var(--sc-warning, #F59E0B)',
        danger: 'var(--sc-danger, #EF4444)',
        info: 'var(--sc-info, #06B6D4)',
    };

    const accentColor = colorMap[color] || colorMap.primary;

    return (
        <div
            className="sc-stat-card sc-hover-lift sc-animate-in"
            style={{
                background: 'var(--sc-bg-card, #ffffff)',
                borderRadius: 'var(--sc-radius-lg, 12px)',
                boxShadow: 'var(--sc-shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
                border: '1px solid var(--sc-border, #e5e7eb)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
            }}
        >

            <div style={{ flex: 1, minWidth: 0 }}>

                <div
                    className="sc-stat-label"
                    style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--sc-text-muted, #9ca3af)',
                        marginBottom: '8px',
                    }}
                >
                    {title}
                </div>

                <div
                    className="sc-stat-value"
                    style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        color: 'var(--sc-text-primary, #111827)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {value}
                </div>

                {subtitle && (
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--sc-success, #22C55E)',
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        {subtitle}
                    </div>
                )}

            </div>

            <div
                className="sc-stat-icon"
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--sc-radius-md, 10px)',
                    background: `${accentColor}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <i
                    className={`bi ${icon}`}
                    style={{
                        fontSize: '22px',
                        color: accentColor,
                    }}
                ></i>
            </div>

        </div>
    );
}