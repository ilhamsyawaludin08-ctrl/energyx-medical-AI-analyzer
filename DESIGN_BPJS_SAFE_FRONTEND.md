# Desain Frontend Pencegahan Penolakan Klaim BPJS

## 1. Masalah yang Ingin Diselesaikan

Dokter sering melakukan kesalahan dalam menentukan diagnosa yang berakibat klaim rumah sakit ke BPJS tidak disetujui. Berdasarkan analisis mendalam terhadap kode backend, masalah utama:

### 1.1. Root Cause Penolakan Klaim BPJS

1. **Diagnosis tidak didukung data klinis** — Dokter memilih diagnosis dari master tanpa memverifikasi kesesuaiannya dengan data SOAP (Subjective, Objective, Assessment, Patient History)
2. **Linkage error** — Diagnosis primer tidak sesuai dengan kode INA-CBG yang digunakan
3. **Dokumentasi tidak lengkap** — Dokumen pendukung sesuai Severity Level tidak lengkap:
   - **Severity Level 1** → Resume Medis WAJIB
   - **Severity Level 2** → Resume Medis + Hasil Laboratorium WAJIB
   - **Severity Level 3** → Resume Medis + Lab + Radiologi/Imaging + Konsultasi Spesialis WAJIB
4. **INA-CBG code salah** — Kode group/subgroup tidak sesuai diagnosis
5. **Diagnosis sekunder tidak relevan** — Diagnosis sekunder tidak mendukung diagnosis primer (mempersulit linkage)
6. **Severity level tidak sesuai** — Level keparahan tidak match dengan kondisi klinis sebenarnya
7. **Tidak ada visualisasi profit/rugi** — Dokter tidak tahu apakah klaim akan profitable atau loss

### 1.2. Data Backend yang Sudah Ada (TIDAK DIUBAH)

| Tabel | Fungsi |
|-------|--------|
| `diagnosis_master` | Master ICD-10 (id, disease_name, icd10_code, doctor_diagnosis, claim) |
| `ai_diagnosis` | Rekomendasi AI (code, title, is_primary, confidence, reason, inacbg, cost, inacbg_list) |
| `ai_treatment` | Rekomendasi tindakan ICD-9-CM (code, title, category, inacbg, cost) |
| `ai_severity` | Severity level AI (level 1-3, justification, checklist) |
| `ai_analysis` | Data pasien SOAP (patient_name, subjective, objective, assessment, encounter_number, service_type) |
| `mrconso` | Database UMLS (code, str, str_indo, chapter, severity, cbg_use_ind) |
| `inacbg` | Database INA-CBG (inacbg, description, severity, deskripsi) |
| `tariff` | Tarif INA-CBG per region & kelas (inacbg, regional, kelas_rawat, tariff) |
| `transaction_bpjs` | Transaksi BPJS (patient_name, status, coverage_amount, cost_amount, profit_amount) |
| `transaction_bpjs_has_diagnosis` | Link transaksi-diagnosis (is_primary) |
| `transaction_bpjs_documents` | Checklist dokumen (has_medical_resume, has_lab_results, has_imaging, dll) |

### 1.3. API Backend yang Sudah Ada (TIDAK DIUBAH)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/v1/recomendation` | Submit data pasien → AI analysis (V1) |
| GET | `/api/recommendation/:id` | Ambil hasil rekomendasi AI |
| GET | `/api/diagnosis?diagnosis=term` | Cari diagnosis master (ICD-10) |
| GET | `/api/transactions` | Daftar transaksi BPJS |
| POST | `/api/transactions` | Buat transaksi BPJS baru |
| GET | `/api/v1/service/encounters` | Daftar encounters |
| GET | `/api/v1/service/encounters/:id` | Detail encounter + AI analysis |
| GET | `/api/v1/dashboard/summary` | Dashboard stats |
| GET | `/api/v1/mrconso` | Search ICD-10 dari mrconso |
| GET | `/api/v1/mrconso_indo` | Search ICD-10 Indonesia |
| POST | `/api/v1/user/login` | Login (JWT) |

---

## 2. User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                     │
│                                                                      │
│  1. Login → Dashboard                                                │
│       │                                                              │
│  2. "Buat Analisis Baru" → Input Data Pasien (SOAP)                 │
│       │                                                              │
│  3. AI Processing → Hasil Rekomendasi                              │
│       │                                                              │
│  4. 🟢 DIAGNOSIS VALIDATION PANEL (HALAMAN UTAMA)                   │
│       ├── Lihat AI Recommendation                                  │
│       ├── Bandingkan dengan Master Diagnosis                       │
│       ├── Validasi Koherensi Klinis                                │
│       └── Pilih/Ubah Diagnosis Final (dengan warning)              │
│       │                                                              │
│  5. 🟢 TINDAKAN MEDIS PANEL                                        │
│       ├── Lihat AI Recommended Procedures                          │
│       ├── Validasi INACBG linkage                                  │
│       └── Pilih/Ubah Tindakan Final                                │
│       │                                                              │
│  6. 🟢 DOCUMENT CHECKLIST PANEL                                    │
│       ├── Auto-check berdasarkan Severity Level                    │
│       ├── Highlight dokumen yang WAJIB tapi belum lengkap           │
│       └── Progress tracker                                         │
│       │                                                              │
│  7. 🟢 CLAIM RISK ASSESSMENT                                       │
│       ├── Risk score (0-100%)                                      │
│       ├── Checklist: diagnosis, linkage, documentation              │
│       └── Klaim: "Peluang Diterima: 85%"                          │
│       │                                                              │
│  8. 🟢 FINANCIAL PROJECTION                                        │
│       ├── Coverage (dari diagnosis_master.claim)                    │
│       ├── Estimated Cost (dari severity)                           │
│       ├── Projected Profit/Loss                                    │
│       └── INACBG Tarif breakdown                                   │
│       │                                                              │
│  9. FINAL VALIDATION GATE                                          │
│       ├── Blok submit jika validasi gagal                          │
│       ├── Show list of issues                                      │
│       └── Hanya submit jika SEMUA validasi OK                      │
│       │                                                              │
│  10. Submit → Transaction Created → Dashboard                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Spesifikasi Per Halaman

### 3.1. Dashboard (Enhanced)

**Tambahan dari existing:**
- Klaim Approval Rate card — Persentase klaim yang disetujui vs ditolak
- Pending Review card — Transaksi yang perlu validasi ulang
- Risk Alert — Notifikasi transaksi berisiko tinggi
- Quick Actions: "Buat Analisis Baru", "Review Klaim Tertunda"

### 3.2. Halaman Analisis Baru (Enhanced)

**Existing:** Form input pasien (patient_name, patient_id, age, gender, subjective, objective, assessment, service_type)

**Tambahan:**
- Form tanda vital (TD, Nadi, RR, Suhu, SpO2, BB, TB) — untuk AI analysis yang lebih akurat
- Auto-fill dari encounter yang sedang berjalan
- Validasi: semua field SOAP wajib diisi sebelum submit ke AI

### 3.3. 🆕 Diagnosis Validation Panel (HALAMAN BARU — CORE FEATURE)

Ini adalah halaman paling kritis. Muncul otomatis setelah AI analysis selesai.

**Layout 2 kolom:**

```
┌─────────────────────────────────────────┬─────────────────────────────────┐
│  AI RECOMMENDATION                      │  DOCTOR SELECTION               │
│  (Referensi — Bukan Keputusan)           │  (Keputusan Final)              │
│                                          │                                 │
│  ┌───────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │ 🔴 DIAGNOSIS PRIMER               │  │  │ 🔍 Cari diagnosis...     │  │
│  │                                   │  │  │                          │  │
│  │ [A09] Gastroenteritis (85%)       │  │  │ ┌──────────────────────┐ │  │
│  │    ✅ Rekomendasi AI              │  │  │ │ A09 Gastroenteritis  │ │  │
│  │    💡 Gejala: diare, muntah       │  │  │ │   ICD-10: A09        │ │  │
│  │                                   │  │  │   Claim: Rp X          │ │  │
│  │ [K59.1] Diare Fungsional (75%)    │  │  │ │   ⚠️ Tidak sesuai    │ │  │
│  │    ⚠️ Rekomendasi AI              │  │  │ │   → dengan gejala    │ │  │
│  │                                   │  │  │ ├──────────────────────┤ │  │
│  │ 🔵 DIAGNOSIS SEKUNDER             │  │  │ │ A08.4 Infeksi Virus  │ │  │
│  │                                   │  │  │ │   ICD-10: A08.4      │ │  │
│  │ [E86] Dehidrasi (90%)             │  │  │ │   Claim: Rp Y        │ │  │
│  │    ✅ Rekomendasi AI              │  │  │ ├──────────────────────┤ │  │
│  │                                   │  │  │ │ [Kosong — pilih]     │ │  │
│  │ [R50.9] Demam (85%)               │  │  │ └──────────────────────┘ │  │
│  │    ✅ Rekomendasi AI              │  │  │                          │  │
│  └───────────────────────────────────┘  │  │ [✓ Pilih Diagnosis]      │  │
│                                          │  └──────────────────────────┘  │
│  ┌───────────────────────────────────┐  │                                 │
│  │ ⚠️ COHERENCE CHECK                │  │  STATUS:                       │
│  │                                   │  │  ┌─────────────────────────┐  │
│  │ ✅ Gejala pasien mendukung        │  │  │ ✅ Diagnosis dipilih    │  │
│  │ ✅ ICD-10 valid                   │  │  │ ✅ Support dari AI      │  │
│  │ ⚠️ Diagnosis sekunder kurang      │  │  │ ⚠️ 1 diagnosis belum  │  │
│  │    relevan                        │  │  │    dipilih             │  │
│  └───────────────────────────────────┘  │  └─────────────────────────┘  │
└─────────────────────────────────────────┴─────────────────────────────────┘
```

**Fitur validasi:**

1. **Clinical Coherence Check** — Sistem membandingkan diagnosis yang dipilih dengan data SOAP:
   - Jika pasien punya gejala "diare, muntah" → sistem cek apakah diagnosis yang dipilih masuk chapter yang sesuai (A09, K59, A08)
   - Jika dokter memilih diagnosis dari chapter yang TIDAK relevan → WARNING merah besar

2. **AI Confidence Indicator** — Setiap diagnosis ditampilkan dengan:
   - 🔴 Merah = Rekomendasi AI (confidence tinggi, doctor wajib pertimbangkan)
   - 🔵 Biru = Diagnosis non-AI (bisa dipilih, tapi sistem akan check coherence)
   - 🟡 Kuning = Low confidence (perlu perhatian)

3. **Master Diagnosis Integration** — Dokter bisa:
   - Pilih dari AI recommendation (aman, sudah valid)
   - Pilih dari diagnosis_master via search (mirip mrconso search)
   - Setiap pilihan divalidasi: ada di master? valid ICD-10? claim amount?

4. **Linkage Check** — Untuk setiap diagnosis:
   - Tampilkan INACBG code yang sesuai
   - Tampilkan tariff dari database
   - Warning jika INACBG tidak sesuai dengan chapter diagnosis

### 3.4. 🆕 Tindakan Medis Panel

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  TINDAKAN MEDIS — AI Recommendation vs Final Selection              │
│                                                                      │
│  AI suggests these procedures for this case:                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [89.39] Lab Darah Lengkap                  ✅ AI Rec. (95%)    │ │
│  │   Kategori: Diagnostik           INACBG: P-7-10-I              │ │
│  │   Tarif: Rp 350.000               Status: ✅ Terpilih           │ │
│  │   Alasan: Monitoring status infeksi                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [87.44] Rontgen Thorax                     ✅ AI Rec. (98%)    │ │
│  │   Kategori: Radiologi            INACBG: D-5-10-I              │ │
│  │   Tarif: Rp 250.000               Status: ✅ Terpilih           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [90.05] Tes HIV                          ✅ AI Rec. (90%)     │ │
│  │   Kategori: Diagnostik           INACBG: A-1-10-I              │ │
│  │   Tarif: Rp 150.000               Status: ❌ TIDAK dipilih     │ │
│  │   ⚠️ AI merekomendasikan tindakan ini                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ LINKAGE WARNING                                              │ │
│  │  INACBG code 'A-1-10-I' untuk Tes HIV tidak linkage dengan    │ │
│  │  diagnosis primer A09 (Gastroenteritis). Pastikan tindakan     │ │
│  │  ini memang relevan untuk kasus ini.                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5. 🆕 Document Checklist Panel

**Berbasis Severity Level** — Dokumen yang wajib berbeda untuk setiap level:

```
┌─────────────────────────────────────────────────────────────────────┐
│  DOKUMENTASI — Persyaratan Klaim BPJS                              │
│                                                                      │
│  Severity Level: 2 (Sedang)                                         │
│  Jenis Pelayanan: Rawat Inap                                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  REQUIRED FOR SEVERITY LEVEL 2                                 │ │
│  │                                                                │ │
│  │  ✅ 1. Resume Medis Lengkap                                    │ │
│  │     (ICD + Tindakan + Kronologi Penyakit)                      │ │
│  │     Status: ✅ Sudah dilengkapi                                │ │
│  │                                                                │ │
│  │  ✅ 2. Hasil Laboratorium                                      │ │
│  │     (HbA1c, GDS, Kreatinin, Urin, dll)                         │ │
│  │     Status: ✅ Sudah dilengkapi                                │ │
│  │                                                                │ │
│  │  ⚠️ 3. Hasil Radiologi / Imaging                               │ │
│  │     Status: ❌ BELUM dilengkapi                                │ │
│  │     → Untuk Severity Level 2, radiologi DISARANKAN             │ │
│  │                                                                │
│  │  🔴 4. Konsultasi Dokter Spesialis                             │ │
│  │     Status: ❌ BELUM dilengkapi                                │ │
│  │     → WAJIB untuk Severity Level 2                            │ │
│  │                                                                │ │
│  │  🟡 5. Bukti Terapi IV                                         │ │
│  │     (Antibiotik, Insulin, dll)                                 │ │
│  │     Status: ℹ️ Opsional                                        │ │
│  │                                                                │ │
│  │  🟡 6. Catatan Harian Perawatan                                │ │
│  │     Status: ℹ️ Opsional                                        │ │
│  │                                                                │ │
│  │  🟡 7. Surat Rawat Inap ≥ 5 Hari                               │ │
│  │     Status: ℹ️ Opsional                                        │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Progress: 2/7 dokumen lengkap (29%)                                │
│  Status Klaim: 🔴 TIDAK BISA submit — 2 dokumen wajib belum lengkap │
└─────────────────────────────────────────────────────────────────────┘
```

**Kewajiban Dokumen per Severity Level:**

| Dokumen | Level 1 (Ringan) | Level 2 (Sedang) | Level 3 (Berat) |
|---------|------------------|-------------------|-----------------|
| Resume Medis | WAJIB | WAJIB | WAJIB |
| Hasil Lab | DISARANKAN | WAJIB | WAJIB |
| Radiologi/Imaging | Opsional | DISARANKAN | WAJIB |
| Konsultasi Spesialis | Opsional | WAJIB | WAJIB |
| Bukti Terapi IV | Opsional | Opsional | WAJIB (jika ada terapi) |
| Catatan Harian | Opsional | DISARANKAN | WAJIB |
| Surat Rawat Inap ≥5 hari | Opsional | Opsional | DISARANKAN |

### 3.6. 🆕 Claim Risk Assessment Panel

**Kalkulasi Risk Score:**
```
Risk Score = 100 - (penalty dari setiap faktor risiko)

Faktor Risiko & Penalti:
┌────────────────────────────────────────────────────────────┐
│ Faktor                     | Penalti | Status              │
├────────────────────────────────────────────────────────────┤
│ Diagnosis tidak di AI Rec  | -15%     | Jika doctor memilih │
│                            |         | diagnosis yang tidak │
│                            |         | direkomendasikan AI  │
│ Coherence rendah           | -20%     | Diagnosis tidak       │
│                            |         | match dengan gejala  │
│ Linkage INA-CBG buruk      | -20%     | INACBG tidak sesuai  │
│                            |         | diagnosis            │
│ Dokumen tidak lengkap      | -10%     | Per dokumen wajib    │
│                            |         | yang belum lengkap   │
│ Severity tidak sesuai      | -15%     | AI & doctor disagree  │
│ Clinical evidence lemah    | -10%     | Data SOAP tidak       │
│                            |         | mendukung diagnosis  │
└────────────────────────────────────────────────────────────┘

Hasil:
┌────────────────────────────────────────────────────────────┐
│ 🟢 Score: 85-100  — PELUANG DITERIMA TINGGI               │
│ 🟡 Score: 60-84   — PELUANG DITERIMA SEDANG               │
│ 🔴 Score: <60     — PELUANG DITERIMA RENDAH               │
│                                                             │
│ Rekomendasi:                                                │
│ • Tambahkan konsultasi spesialis untuk +10%                │
│ • Pastikan linkage diagnosis-tindakan                      │
└────────────────────────────────────────────────────────────┘
```

### 3.7. 🆕 Financial Projection Panel

**Tampilan:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  PROYEKSI KEUANGAN                                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Coverage (BPJS akan bayar):                                   │ │
│  │  Rp 8.500.000                                                  │ │
│  │  (dari diagnosis_master.claim)                                 │ │
│  │                                                                │ │
│  │  Estimated Cost (Biaya Rumah Sakit):                           │ │
│  │  Rp 5.000.000                                                  │ │
│  │  (Severity Level 2 = Rp 2.000.000 + estimasi tindakan)         │ │
│  │                                                                │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                 │ │
│  │                                                                │ │
│  │  Projected Profit:                                             │ │
│  │  +Rp 3.500.000 (+41.2%)                                       │ │
│  │  🟢 Profitable                                                 │ │
│  │                                                                │ │
│  │  ⚠️  Jika klaim ditolak: -Rp 5.000.000 ( LOSS )               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  INACBG Tariff Breakdown:                                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ A09 - Gastroenteritis           P-7-10-I   Rp 350.000         │ │
│  │ 89.39 - Lab Darah               P-7-10-I    Rp 200.000        │ │
│  │ 87.44 - Rontgen Thorax          D-5-10-I   Rp 250.000         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.8. 🆕 Final Validation Gate (BEFORE SUBMIT)

Ini adalah gerbang terakhir sebelum transaksi dibuat. **Tidak boleh dilewati jika validasi gagal.**

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔒 FINAL VALIDATION — Sebelum Submit Klaim                        │
│                                                                      │
│  Checklist Validasi:                                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Diagnosis Primer                                           │ │
│  │     Dipilih dari Master Diagnosis dengan ICD-10 valid          │ │
│  │                                                                │ │
│  │  ✅ Diagnosis Sekunder                                         │ │
│  │     2 diagnosis sekunder dipilih dan mendukung primer          │ │
│  │                                                                │
│  │  ✅ INACBG Code                                                │ │
│  │     Kode INA-CBG sesuai dengan diagnosis utama                 │ │
│  │     (A09 → P-7-10-I ✓)                                        │ │
│  │                                                                │
│  │  ✅ Dokumentasi Lengkap                                        │ │
│  │     Semua dokumen wajib Severity Level 2 sudah dilengkapi      │ │
│  │     (2/2 wajib ✓)                                             │ │
│  │                                                                │ │
│  │  ✅ Clinical Coherence                                         │ │
│  │     Diagnosis didukung oleh data klinis (SOAP)                 │ │
│  │     (85% match ✓)                                             │ │
│  │                                                                │ │
│  │  ⚠️ Tindakan Medis                                             │ │
│  │     1 tindakan tidak memiliki linkage INACBG                   │ │
│  │     → Tetap bisa submit dengan konfirmasi                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Risk Score: 85% — Peluang Klaim Disetujui: TINGGI             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [BLOKIR] Submit Transaksi                                     │ │
│  │  Tombol HANYA aktif jika SEMUA validasi ✅                     │ │
│  │                                                                │ │
│  │  Saat aktif:                                                   │ │
│  │  [✅ Submit Klaim BPJS]                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Validasi Rules Engine

### 4.1. Rule: Diagnosis Must Be From Master
```javascript
// Sebelum submit, pastikan diagnosis dipilih dari diagnosis_master
// Bukan sekadar kode ICD yang diketik manual
if (!diagnosis.fromMaster) {
  error.push('Diagnosis harus dipilih dari database master, bukan diketik manual');
}
```

### 4.2. Rule: Primary + Secondary Coherence
```javascript
// Diagnosis primer dan sekunder harus dari chapter ICD-10 yang konsisten
// Contoh: A09 (Penyakit Infeksi) + E86 (Dehidrasi) = ✅ Coherent
// Contoh: A09 (Penyakit Infeksi) + S72.1 (Fraktur Pinggul) = ❌ Incoherent
const chapterMatch = isChapterCoherent(primaryDiagnosis, secondaryDiagnosis);
if (!chapterMatch) {
  warning.push('Diagnosis sekunder tidak coherent dengan diagnosis primer');
}
```

### 4.3. Rule: INACBG Linkage
```javascript
// INACBG code harus sesuai dengan diagnosis chapter
// A (Infeksi) → A-x-x-x
// I (Kardiovaskular) → I-x-x-x
const linkage = validateInacbgLinkage(diagnosisCode, inacbgCode);
if (!linkage.isValid) {
  error.push(`INACBG ${inacbgCode} tidak linkage dengan diagnosis ${diagnosisCode}`);
}
```

### 4.4. Rule: Severity → Document Mapping
```javascript
// Setiap severity level mewajibkan dokumen tertentu
const requiredDocs = getRequiredDocuments(severityLevel);
const missingDocs = requiredDocs.filter(doc => !completedDocs[doc]);
if (missingDocs.length > 0) {
  error.push(`Dokumen wajib belum lengkap: ${missingDocs.join(', ')}`);
}
```

### 4.5. Rule: SOAP → Diagnosis Coherence
```javascript
// Data SOAP harus mendukung diagnosis yang dipilih
// Jika subjective mention "diare, muntah", diagnosis harus dari chapter
// A (Infeksi), K (Pencernaan), atau A08/A09 (Infeksi Virus Usus)
const coherenceScore = calculateCoherence(soaData, selectedDiagnosis);
if (coherenceScore < 50) {
  error.push('Data klinis tidak mendukung diagnosis yang dipilih');
}
```

### 4.6. Rule: Minimum Diagnoses
```javascript
// BPJS minimal 1 diagnosis primer + 0-2 sekunder
if (!primaryDiagnosis) {
  error.push('Diagnosis primer wajib dipilih');
}
```

---

## 5. Design System

### 5.1. Color Palette (Medical Context)

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Primary | `#1e40af` (dark blue) | Tombol utama, navigasi aktif |
| Success | `#059669` (green) | Validasi OK, profitable, approved |
| Warning | `#d97706` (amber) | Perhatian, perlu review |
| Danger | `#dc2626` (red) | Error, klaim berisiko, tidak valid |
| Info | `#0891b2` (cyan) | Info, AI recommendation badge |
| Neutral 50 | `#f9fafb` | Background |
| Neutral 100 | `#f3f4f6` | Card backgrounds |
| Neutral 800 | `#1f2937` | Text |
| Neutral 400 | `#9ca3af` | Secondary text, borders |

### 5.2. Typography

- Font family: Inter (via Google Fonts CDN) — sama seperti existing
- Heading: 600-700 weight
- Body: 400-500 weight
- Code/ICD codes: Monospace

### 5.3. Component Patterns

**Badge (Status):**
- `badge-success` — hijau, untuk validasi OK
- `badge-warning` — amber, untuk perhatian
- `badge-danger` — merah, untuk error/risk
- `badge-primary` — biru, untuk AI recommendation
- `badge-info` — cyan, untuk info

**Card (Container):**
- White background, subtle border
- Header dengan border-bottom
- Body dengan padding
- Optional: colored left border (blue = AI, green = doctor, red = warning)

**Alert (Notification):**
- Inline alert boxes untuk warning/error
- Icon + message
- Dismissible

### 5.4. Spacing

- Grid gap: 1.5rem (24px)
- Card padding: 1.5rem
- Section margin: 2rem
- Element spacing: 0.5rem, 1rem increments

---

## 6. State Management

### 6.1. Frontend State

```javascript
const state = {
  // Auth (existing)
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  
  // Current analysis being worked on
  currentAnalysis: null,  // ai_analysis data
  aiRecommendations: null,  // diagnosis + treatment + severity from AI
  
  // Doctor's final selections
  selectedPrimaryDiagnosis: null,  // from diagnosis_master
  selectedSecondaryDiagnoses: [],  // from diagnosis_master
  selectedTreatments: [],  // from AI recommendations
  
  // Document checklist
  documentChecklist: {
    has_medical_resume: false,
    has_lab_results: false,
    has_imaging: false,
    has_specialist_consultation: false,
    has_iv_therapy_proof: false,
    has_daily_care_notes: false,
    has_min_5day_inpatient: false,
    severity_level: null
  },
  
  // Validation results
  validation: {
    isValid: false,
    errors: [],
    warnings: [],
    riskScore: 0,
    riskLevel: 'unknown'  // 'low' | 'medium' | 'high'
  },
  
  // Navigation
  currentPage: 'dashboard',
  lastPage: 'encounters'
};
```

### 6.2. Data Flow

```
1. User submits SOAP form
   ↓
2. POST /api/v1/recomendation
   ↓
3. AI processes → saves to ai_analysis, ai_diagnosis, ai_treatment, ai_severity
   ↓
4. GET /api/recommendation/:id → load results
   ↓
5. Render Diagnosis Validation Panel
   ↓
6. Doctor selects/changes diagnoses
   ↓
7. Real-time validation runs
   ↓
8. Doctor fills document checklist
   ↓
9. Risk assessment computed
   ↓
10. Final validation gate checked
   ↓
11. If all OK → POST /api/transactions
   ↓
12. Redirect to Dashboard / Encounters
```

---

## 7. Implementation Notes

### 7.1. Architecture

- Single-file HTML (`src/public/ui/index.html`) — sama seperti existing
- Tailwind CSS CDN — sama seperti existing
- Vanilla JavaScript — sama seperti existing
- FontAwesome icons — sama seperti existing

### 7.2. No Backend Changes

Semua validasi dilakukan di frontend. Backend tetap menerima data apa adanya. Frontend adalah safety net, bukan gatekeeper di server.

### 7.3. Key Principle

**"Make it impossible to make a mistake without noticing."**

Setiap kali dokter akan melakukan sesuatu yang berisiko:
1. Sistem menampilkan warning yang jelas
2. Sistem menjelaskan WHY ini berisiko
3. Sistem menunjukkan WHAT should be done instead
4. Dokter harus explicitly confirm untuk melanjutkan (tidak bisa skip tanpa disadari)

### 7.4. Page Navigation Changes

**Existing pages yang perlu di-replace:**
1. Dashboard — Enhanced (tambah claim stats)
2. New Analysis — Enhanced (tambah tanda vital)
3. Encounters — Enhanced (tambah link ke validation panel)
4. Diagnosis — Di-replace dengan Diagnosis Validation Panel
5. Transactions — Enhanced (tambah risk indicator)
6. Settings — Sama

**New navigation:**
- Dashboard
- New Analysis
- Encounters
- Diagnosis Validation (replaces "Diagnosis")
- Transactions

---

## 8. Summary of Key Features

| No | Feature | Purpose |
|----|---------|---------|
| 1 | Clinical Coherence Check | Pastikan diagnosis didukung data klinis pasien |
| 2 | AI Recommendation Display | Tampilkan saran AI sebagai referensi, bukan keputusan |
| 3 | INACBG Linkage Validator | Pastikan diagnosis-tindakan cocok |
| 4 | Severity-based Document Checklist | Pastikan dokumen lengkap sesuai severity |
| 5 | Claim Risk Score | Visualisasi peluang klaim disetujui |
| 6 | Financial Projection | Tampilkan profit/loss estimation |
| 7 | Final Validation Gate | Blok submit jika validasi gagal |
| 8 | Master Diagnosis Integration | Dokter pilih dari database, bukan ketik manual |
