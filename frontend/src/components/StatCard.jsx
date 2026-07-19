export default function StatCard({
    title,
    value,
    icon,
    color = "primary",
    subtitle
}) {
    return (
        <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex justify-content-between align-items-center">

                <div>

                    <small className="text-muted">
                        {title}
                    </small>

                    <h3 className="fw-bold mt-2">
                        {value}
                    </h3>

                    {subtitle && (
                        <small className="text-success">
                            {subtitle}
                        </small>
                    )}

                </div>

                <div
                    className={`bg-${color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                    style={{
                        width: 60,
                        height: 60
                    }}
                >
                    <i
                        className={`bi ${icon} fs-3 text-${color}`}
                    ></i>
                </div>

            </div>

        </div>
    );
}