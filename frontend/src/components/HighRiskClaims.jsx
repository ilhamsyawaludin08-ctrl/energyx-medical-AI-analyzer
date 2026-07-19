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

    return (

        <div className="card shadow-sm border-0 h-100">

            <div className="card-header bg-white">

                <h5 className="mb-0">

                    High Risk Claims

                </h5>

            </div>

            <div className="card-body">

                {

                    data.map((item, index) => (

                        <div
                            key={index}
                            className="mb-4"
                        >

                            <div className="d-flex justify-content-between">

                                <strong>

                                    {item.patient}

                                </strong>

                                <span className="text-danger">

                                    {item.score}%

                                </span>

                            </div>

                            <div className="progress mt-2">

                                <div
                                    className="progress-bar bg-danger"
                                    style={{
                                        width: `${item.score}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}