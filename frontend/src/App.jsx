import { useState } from "react";
import api from "./api/api";

import Loading from "./components/Loading";
import ResultCard from "./components/ResultCard";

function App() {
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!condition.trim()) {
      alert("Masukkan data pasien terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setError("");

      const res = await api.post("/recomendation", {
        condition,
      });

      console.log(res.data);

      setResult(res.data.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan pada server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-10">

          <div className="card shadow-lg">

            <div className="card-body p-4">

              <h2 className="text-center mb-3">
                🩺 EnergyX Medical AI Analyzer
              </h2>

              <p className="text-center text-muted">
                Masukkan data pasien untuk mendapatkan rekomendasi AI.
              </p>

              <textarea
                className="form-control"
                rows={12}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder={`ID Pasien: 001
Nama: Ilham
Jenis Pelayanan: Rawat Jalan
Creator: Admin

Subjective:
Pasien mengalami demam tinggi, batuk, dan sesak napas selama 3 hari`}
              />

              <div className="d-grid mt-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={analyze}
                  disabled={loading}
                >
                  🔍 Analisis AI
                </button>
              </div>

            </div>
          </div>

          {loading && <Loading />}

          {error && (
            <div className="alert alert-danger mt-4">
              {error}
            </div>
          )}

          {result && <ResultCard result={result} />}

        </div>

      </div>

    </div>
  );
}

export default App;