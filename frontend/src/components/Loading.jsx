export default function Loading() {

    const spinKeyframes = `
        @keyframes sc-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes sc-pulse-text {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes sc-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    return (
        <div
            className="sc-animate-in"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px',
                minHeight: '400px',
                animation: 'sc-fade-in 0.6s ease-out',
            }}
        >
            <style>{spinKeyframes}</style>

            {/* Spinning Circle */}
            <div
                style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: '4px solid var(--sc-border, #e5e7eb)',
                    borderTopColor: 'var(--sc-primary, #2563EB)',
                    animation: 'sc-spin 1s linear infinite',
                    marginBottom: '32px',
                }}
            />

            {/* Pulsing Main Text */}
            <h4
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--sc-text-primary, #111827)',
                    margin: '0 0 8px 0',
                    animation: 'sc-pulse-text 2s ease-in-out infinite',
                    letterSpacing: '-0.01em',
                }}
            >
                AI sedang menganalisis...
            </h4>

            {/* Subtitle */}
            <p
                style={{
                    fontSize: '14px',
                    color: 'var(--sc-text-muted, #9ca3af)',
                    margin: 0,
                    fontWeight: 500,
                }}
            >
                Memproses data klinis...
            </p>

        </div>
    );
}