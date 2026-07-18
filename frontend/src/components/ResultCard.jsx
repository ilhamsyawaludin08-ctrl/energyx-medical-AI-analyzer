export default function ResultCard({ result }) {

    if (!result) return null;

    return (

        <div className="card shadow mt-4">

            <div className="card-header bg-primary text-white">

                Hasil Analisis AI

            </div>

            <div className="card-body">

                <div
                    dangerouslySetInnerHTML={{
                        __html: result.response_raw,
                    }}
                />

            </div>

        </div>

    );
}