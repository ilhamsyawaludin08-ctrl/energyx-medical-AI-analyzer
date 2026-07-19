require('dotenv').config();
const { OpenAI } = require('openai');
const { findTariffAllByInacbg } = require("../repositories/tariffRepository");
const { findInacbgByCodeDiagnosa, findInacbgByTindakanDiagnosa } = require('../repositories/inaGrouper4SpecialGroupsRepository');
const { getMrconsoStr, updateStrMRConso } = require('../repositories/mrconsoRepository')
const handleError = require('../monitor/errorHandler');

const aiClient = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL
});

const getRecommendation = async (inputan) => {
  try {

    // Dedicated INACBG System Prompt
    const inacbgSystemPrompt = `
      PANDUAN LENGKAP KODE INACBG UNTUK TINDAKAN MEDIS:

      FORMAT KODE: X-Y-Z-W (berdasarkan standar BPJS Indonesia)

      ATURAN AWALAN KATEGORI/SISTEM ORGAN (X):
      A = Penyakit Infeksi dan Parasitik
      B = Neoplasma (tumor jinak, ganas, dan lainnya)
      C = Gangguan Darah dan Organ Pembentuk Darah
      D = Gangguan Endokrin, Nutrisi, dan Metabolik
      E = Gangguan Mental dan Perilaku
      F = Gangguan Sistem Saraf
      G = Gangguan Mata dan Adneksanya
      H = Gangguan Telinga, Hidung, dan Tenggorokan
      I = Gangguan Sistem Kardiovaskular
      J = Gangguan Sistem Pernapasan
      K = Gangguan Sistem Pencernaan
      L = Gangguan Hepatobilier dan Pankreas
      M = Gangguan Kulit, Jaringan Subkutan dan Payudara
      N = Gangguan Sistem Muskuloskeletal dan Jaringan Ikat
      O = Gangguan Sistem Urinaria
      P = Kehamilan, Persalinan, dan Masa Nifas
      Q = Gangguan Neonatal (Bayi Baru Lahir)
      T = Cedera, Keracunan, dan Konsekuensi Lain dari Penyebab Eksternal
      U = Prosedur Diagnosis dan Terapi Khusus
      V = Kondisi Klinis Lainnya yang Tidak Terklasifikasi Lain
      W = Prosedur-prosedur Tambahan (Investigasi Lanjutan)
      Z = Pemeriksaan Khusus / Screening / Penunjang

      PENTING: GUNAKAN HANYA KODE YANG ADA DI DATABASE!
      Berdasarkan data master yang sebenarnya:
      - Y (posisi ke-2): 3, 4 (untuk kategori Z dan U)
      - Y (posisi ke-2): 1, 2, 3, 4 (untuk kategori A-V diagnosis)
      - Z (posisi ke-3): 10, 11, 12, 13, 14
      - W (posisi ke-4): 0, I, II, III

      ATURAN WAJIB KORELASI SEVERITY:
      1. Rawat jalan: kode SELALU berakhiran -0
      2. Rawat inap: kode berakhiran sesuai severity level HANYA untuk:
        - SEVERITY LEVEL 1 (Ringan) → berakhiran -I
        - SEVERITY LEVEL 2 (Sedang) → berakhiran -II
        - SEVERITY LEVEL 3 (Berat) → berakhiran -III

      PENTING: JENIS PELAYANAN vs TINDAKAN MEDIS
      - PEMERIKSAAN (Lab, Rontgen, EKG, USG, Endoskopi) = RAWAT JALAN (-0)
      - PERAWATAN/TERAPI BERKELANJUTAN = RAWAT INAP (-I/-II/-III)

      CONTOH KODE YANG BENAR:

      PEMERIKSAAN - RAWAT JALAN (berakhiran -0):
      - Lab darah: Z-3-10-0
      - EKG: Z-3-12-0
      - Rontgen: Z-3-13-0
      - USG: Z-3-14-0
      - CT Scan: Z-4-13-0
      - Endoskopi: U-3-11-0
      - MRI: Z-4-14-0

      PERAWATAN/TERAPI - RAWAT INAP (berakhiran sesuai severity):
      SEVERITY LEVEL 1 (RINGAN):
      - Monitoring rawat inap: U-3-10-I
      - Terapi infus: U-3-11-I
      - Observasi: U-4-10-I

      SEVERITY LEVEL 2 (SEDANG):
      - Monitoring intensif: U-3-12-II
      - Terapi kompleks: U-4-11-II
      - Perawatan khusus: U-4-12-II

      SEVERITY LEVEL 3 (BERAT):
      - ICU monitoring: U-4-13-III
      - Perawatan kritis: U-4-14-III
      - Resusitasi: U-4-15-III

      DIAGNOSIS PENYAKIT (contoh yang tersedia):
      - Gastroenteritis: K-1-11-I, K-2-10-I, K-2-11-I
      - Sepsis: A-4-10-I sampai A-4-14-III (tergantung severity)
      - Gagal ginjal: O-3-11-I, O-3-12-I, O-4-13-I

      FORMAT YANG BENAR UNTUK PEMERIKSAAN/PROSEDUR:
      - Gunakan Z-3-XX-X atau Z-4-XX-X untuk pemeriksaan
      - Gunakan U-3-XX-X atau U-4-XX-X untuk prosedur khusus
      - Gunakan W-3-XX-X atau W-4-XX-X untuk investigasi tambahan

      LARANGAN:
      - JANGAN gunakan Z-1-XX-X atau Z-2-XX-X (TIDAK ADA di database!)
      - JANGAN gunakan U-1-XX-X atau U-2-XX-X (TIDAK ADA di database!)
      - JANGAN gunakan Y > 4 atau Z > 14

      KAMU WAJIB menggunakan HANYA kode yang benar-benar ada di database master!

      LOGIKA PEMILIHAN KODE:
      1. PEMERIKSAAN apapun (Lab, Rontgen, EKG, USG, CT, MRI, Endoskopi) = -0
      2. PERAWATAN/TERAPI berkelanjutan = sesuai severity (-I/-II/-III)
      3. Meskipun pasien rawat inap, pemeriksaan tetap menggunakan kode -0
    `;

    const medicalSystemPrompt = `
      Kamu adalah sistem pendukung keputusan klinis yang bertindak sebagai asisten dokter.
      Kamu memiliki keahlian tinggi dalam:
       - Klasifikasi penyakit menggunakan ICD-10 dan ICD-9-CM
       - Pengkodean INA-CBG untuk klaim dan penilaian biaya pelayanan kesehatan
       - Penerapan clinical pathway dan evidence-based clinical guidelines
       - Penilaian tingkat keparahan kasus (severity level) secara objektif dan konsisten

      Tugas utama kamu adalah:
       - Melakukan analisis klinis berdasarkan data SOAP (Subjective, Objective, Assessment, Plan) yang tersedia
       - Menentukan diagnosis utama dan diagnosis sekunder sesuai ICD-10
       - Menentukan tindakan medis dan prosedur sesuai ICD-9-CM
       - Memberikan rekomendasi tindakan medis berdasarkan best practice
       - Menentukan kode INA-CBG yang sesuai, termasuk kode group, sub-group, severity level, dan justifikasi medis

      Prinsip utama:
      - Tidak membuat asumsi di luar data yang diberikan
      - Menggunakan terminologi medis standar dan valid
      - Menyampaikan output secara sistematis, ringkas, dan profesional
    `;

    const output = `
      OUTPUT - AI ANALYSIS & RECOMMENDATIONS :

      DIAGNOSIS PRIMER
          A09 - Gastroenteritis dan kolitis tidak spesifik (REKOMENDASI AI)
          Confidence: 85%
          Alasan: Gejala klasik gastroenteritis dengan dehidrasi

          K59.1 - Diare fungsional
          Confidence: 75%
          Alasan: Pola diare tanpa tanda infeksi berat

          A08.4 - Infeksi virus usus
          Confidence: 70%
          Alasan: Onset akut dengan gejala sistemik

      DIAGNOSIS SEKUNDER
          E86 - Dehidrasi (REKOMENDASI AI)
          Confidence: 90%
          Alasan: Tanda klinis dehidrasi jelas

          R50.9 - Demam tidak spesifik (REKOMENDASI AI)
          Confidence: 85%
          Alasan: Demam tinggi persisten

          R11 - Mual dan muntah (REKOMENDASI AI)
          Confidence: 80%
          Alasan: Gejala penyerta yang signifikan

          Z51.1 - Kemoterapi untuk neoplasma
          Confidence: 60%
          Alasan: Diagnosis diferensial (tidak relevan)

      TINDAKAN MEDIS
          89.39 - Pemeriksaan laboratorium darah lengkap (REKOMENDASI AI)
          Kategori: Diagnostik
          Confidence: 90%
          Alasan: Monitoring status infeksi dan dehidrasi
          INACBG: P-7-10-I

          87.44 - Rontgen thorax
          Kategori: Radiologi
          Confidence: 70%
          Alasan: Menyingkirkan komplikasi paru
          INACBG: D-5-10-I

          89.52 - Pemeriksaan elektrokardiogram
          Kategori: Diagnostik
          Confidence: 50%
          Alasan: Monitoring kardiovaskular pada dehidrasi
          INACBG: E-6-10-I

      SEVERITY LEVEL - 2
          ✅ Resume Medis (WAJIB Severity Level - 1)
          ✅ Hasil Laboratorium (WAJIB Severity Level - 2)
          ❌ Hasil Radiologi (WAJIB Severity Level - 3)
          ❌ Lembar Observasi (Opsional)

      JENIS PELAYANAN : [ Rawat Jalan / Rawat Inap ]
    `;

    const contextUser = `
      Berikut data pasien yang perlu dianalisis secara klinis:

      ${inputan}

      PENTING UNTUK KODE INACBG:
      - Gunakan HANYA kode yang ada di database master
      - Format maksimal: X-4-14-III (tidak ada Y>4 atau Z>14)
      - Pastikan kode yang dipilih realistis dan tersedia

      Berdasarkan data pasien di atas, buatlah ANALISIS dengan output yang memenuhi persyaratan berikut (REQUIREMENT OUTPUT):

      1. Diagnosis Primer:
        - Tampilkan **tepat 3 diagnosis primer** yang paling relevan berdasarkan data klinis pasien.
        - Gunakan format berikut untuk setiap diagnosis:
          [Kode ICD] - [Nama Diagnosis] (REKOMENDASI AI) — **hanya jika diagnosis tersebut adalah yang paling direkomendasikan** menurut kondisi pasien.
        - Sertakan tingkat **confidence (%)** dan **alasan singkat** mengapa diagnosis tersebut dipilih.
        - Jangan tampilkan diagnosis yang tidak relevan atau confidence-nya rendah.

      2. Diagnosis Sekunder:
        - Tampilkan **tepat 3 diagnosis sekunder** yang relevan sebagai pendukung diagnosis utama.
        - Gunakan format berikut:
          [Kode ICD] - [Nama Diagnosis] (REKOMENDASI AI) — **hanya untuk diagnosis sekunder yang paling direkomendasikan** berdasarkan data pasien.
        - Sertakan **confidence (%)** dan **alasan singkat** mengapa diagnosis tersebut muncul sebagai diagnosis sekunder.
        - Jangan tampilkan diagnosis yang tidak sesuai dengan gejala, tanda vital, atau hasil pemeriksaan fisik/lab.

      3. Tindakan Medis: 
        - tulis tindakan yang benar-benar relevan dan direkomendasikan sesuai data pasien, 
        - Format untuk setiap tindakan:
          [Kode Tindakan] - [Nama Tindakan] (REKOMENDASI AI) — hanya untuk tindakan yang disarankan
          Kategori: [Diagnostik/Terapi/Radiologi/dll]
          Confidence: [%]
          Alasan: [penjelasan singkat]
          INACBG: [WAJIB gunakan kode yang ADA di database: Z-1-10-xxx, Z-2-11-xxx, U-1-11-xxx, dll]
        - Jika jenis perawatan adalah **Rawat Inap**, maka:
          Tampilkan hanya tindakan medis dengan kode INACBG yang memiliki severity **I, II, atau III** (contoh: kode berakhiran -I, -II, -III).
          Jangan tampilkan tindakan dengan severity 0 atau tanpa severity yang sesuai.
        - Jika jenis perawatan adalah **Rawat Jalan**, maka:
          Tampilkan hanya tindakan medis dengan kode INACBG yang memiliki severity **0** (contoh: kode berakhiran -0).
          Jangan tampilkan tindakan dengan severity I, II, atau III.

      4. Severity Level:
        - Tentukan level severity (Level 1, 2, atau 3) berdasarkan kondisi klinis pasien dan kriteria berikut:
          * Level 1 (Ringan): pasien stabil, tanpa tanda bahaya signifikan.
          * Level 2 (Sedang): pasien dengan beberapa tanda ketidakstabilan tapi masih terkendali.
          * Level 3 (Berat): pasien dengan tanda vital tidak stabil, penurunan kesadaran, komplikasi serius (misalnya peritonitis, syok, dehidrasi berat, gangguan elektrolit serius).
        - Berikan justifikasi singkat untuk level severity yang dipilih.
        - Tampilkan checklist (✅ / ❌) untuk dokumen yang tersedia atau tidak berdasarkan input (Resume Medis, Hasil Laboratorium, Radiologi, Lembar Observasi).
        - Jangan tulis ulang isi dokumen yang tidak ada.

      5. Jenis Pelayanan:
        - Sesuaikan dengan data input dari pengguna.
        - Jika jenis pelayanan pada input adalah "rawat jalan", maka tulis: **Rawat Jalan**.
        - Jika jenis pelayanan pada input adalah "rawat inap", maka tulis: **Rawat Inap**.

      🔒 Catatan Konsistensi:
      - Jangan tampilkan informasi yang tidak ada dalam data pasien.
      - Hindari penjelasan berulang, improvisasi, atau hipotesis yang tidak berbasis data.
      - Selalu ikuti format dan struktur di atas secara konsisten.
      - Gunakan bahasa Indonesia medis yang profesional dan jelas.

      Berikut adalah contoh output yang diharapkan (untuk referensi format dan gaya):

      ${output}

      Buat ANALISIS baru berdasarkan data di atas dan PENUHI SEMUA REQUIREMENT OUTPUT. Jangan meniru contoh output secara verbatim. dan fokus pada akurasi klinis.
    `
    const messages = [
      { role: "system", content: medicalSystemPrompt },
      { role: "system", content: inacbgSystemPrompt },
      { role: "user", content: contextUser }
    ];

    const completion = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });


    let reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('No content in AI response');
    }

    // STEP 2: Extract kode INACBG dari response
    const inacbgCodes = [];
    const inacbgMatches = reply.match(/INACBG:\s*([A-Z]-\d+-\d+-[A-Z0-9]+)/g);
    
    if (inacbgMatches) {
      inacbgMatches.forEach(match => {
        const code = match.replace('INACBG:', '').trim();
        if (!inacbgCodes.includes(code)) {
          inacbgCodes.push(code);
        }
      });
    }

    // STEP 3: Ambil tarif dari database jika ada kode INACBG
    if (inacbgCodes.length > 0) {
      const tariffResults = await findTariffAllByInacbg(inacbgCodes);

      tariffResults.forEach(result => {
        
        const tariffFormatted = result.tariff.toLocaleString('id-ID');
        
        const inacbgPattern = new RegExp(
          `(INACBG:\\s*${result.inacbg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
          'gi'
        );

        reply = reply.replace(inacbgPattern, `$1\nTarif: ${tariffFormatted}`);
      });
    }

    return reply.replace(/\n/g, '<br>')

  } catch (error) {
    handleError('error', {
      type: error.name,
      message: error.message,
      stack: error.stack
    });

    throw `Error dalam proses rekomendasi AI: ${error.message}`;
  }
};

const formatInacbgList = (inacbgData) => {
  if (!inacbgData || inacbgData.length === 0) return [];
  
  return inacbgData.flatMap(item => 
    item.inacbg_data?.map(data => {
      const result = {
        inacbg: data.inacbg,
        cmg_description: data.cmg_description,
        cmg_type: data.cmg_type,
        claim: data.tariff || 0
      };
      
      if (data.isSpecial) {
        result.claimSpesial = data.specialTariff || 0;
      }
      
      return result;
    }) || []
  );
};

const getRecommendationV1 = async (inputData) => {
  try {

    if (!inputData) throw new Error('Input data tidak boleh kosong');

    // Validasi field wajib
    const requiredFields = ['patient_id', 'encounter_number', 'unit', 'patient_name', 'subjective', 'objectif', 'assesment', 'creator', 'service_type'];
    const missingFields = requiredFields.filter(field => !inputData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Field yang diperlukan tidak ada: ${missingFields.join(', ')}`);
    }

    // Format tanda vital
    const vitalSigns = inputData.condition || {};
    const vitalSignsList = [
      vitalSigns.TD && `Tekanan Darah: ${vitalSigns.TD}`,
      vitalSigns.N && `Nadi: ${vitalSigns.N}`,
      vitalSigns.RR && `Pernapasan: ${vitalSigns.RR}`,
      vitalSigns.S && `Suhu: ${vitalSigns.S}`,
      vitalSigns.SPO2 && `SpO2: ${vitalSigns.SPO2}`,
      vitalSigns.BB && `Berat Badan: ${vitalSigns.BB}`,
      vitalSigns.TB && `Tinggi Badan: ${vitalSigns.TB}`
    ].filter(Boolean).join('\n');

    const vitalSignsText = vitalSignsList ? `\nTanda Vital:\n${vitalSignsList}` : '';

    const patientInfo = `
      INPUT DATA PEMERIKSAAN

      Data Pasien:
      ID Pasien: ${inputData.patient_id}
      No. Encounter: ${inputData.encounter_number}
      Nama: ${inputData.patient_name}
      ${inputData.age ? `Usia: ${inputData.age} tahun` : ''}
      ${inputData.gender ? `Jenis Kelamin: ${inputData.gender}` : ''}
      ${inputData.weight ? `Berat Badan: ${inputData.weight} kg` : ''}
      Unit/Poli: ${inputData.unit}

      Keluhan & Gejala (Subjective):
      ${inputData.subjective}

      Pemeriksaan Fisik (Objective):
      ${inputData.objectif}

      Assessment/Diagnosis:
      ${inputData.assesment}
      ${vitalSignsText}

      Jenis Pelayanan:
      ${inputData.service_type}

      Petugas Input: ${inputData.creator}
    `;

    const inacbgSystemPrompt = `
      ATURAN KODE INACBG BERDASARKAN KATEGORI PENYAKIT:
      A = Penyakit Infeksi dan Parasitik (TBC, Malaria, HIV, Hepatitis, Sepsis, dll)
      B = Neoplasma (tumor jinak, ganas, kanker, leukemia, dll)
      C = Gangguan Darah dan Organ Pembentuk Darah (anemia, hemofilia, dll)
      D = Gangguan Endokrin, Nutrisi, dan Metabolik (DM, hipertiroid, gizi buruk, dll)
      E = Gangguan Mental dan Perilaku (depresi, skizofrenia, gangguan cemas, dll)
      F = Gangguan Sistem Saraf (stroke, epilepsi, migrain, neuropati, dll)
      G = Gangguan Mata dan Adneksanya (katarak, glaukoma, konjungtivitis, dll)
      H = Gangguan Telinga, Hidung, dan Tenggorokan (sinusitis, faringitis, ISPA, dll)
      I = Gangguan Sistem Kardiovaskular (hipertensi, gagal jantung, PJK, dll)
      J = Gangguan Sistem Pernapasan (pneumonia, asma, PPOK, emfisema, dll)
      K = Gangguan Sistem Pencernaan (gastritis, diare, usus buntu, dll)
      L = Gangguan Hepatobilier dan Pankreas (sirosis, kolesistitis, pankreatitis, dll)
      M = Gangguan Kulit, Jaringan Subkutan dan Payudara (selulitis, abses, dll)
      N = Gangguan Sistem Muskuloskeletal dan Jaringan Ikat (fraktur, arthritis, dll)
      O = Gangguan Sistem Urinaria (ISK, gagal ginjal, batu ginjal, dll)
      P = Kehamilan, Persalinan, dan Masa Nifas
      Q = Gangguan Neonatal (Bayi Baru Lahir)
      T = Cedera, Keracunan, dan Konsekuensi Lain dari Penyebab Eksternal
      U = Prosedur Diagnosis dan Terapi Khusus
      V = Kondisi Klinis Lainnya yang Tidak Terklasifikasi Lain
      W = Prosedur-prosedur Tambahan (Investigasi Lanjutan)
      Z = Pemeriksaan Khusus / Screening / Penunjang

      PETUNJUK PENENTUAN KODE INACBG:
      - Analisis diagnosis utama dan sekunder
      - Cocokkan dengan kategori penyakit di atas
      - Pilih kode yang paling sesuai dengan kondisi dominan pasien
      - Jika ada multiple diagnosis, prioritaskan diagnosis utama
    `;

    const medicalSystemPrompt = `
      Kamu adalah sistem pendukung keputusan klinis yang bertindak sebagai asisten dokter.
      Kamu memiliki keahlian tinggi dalam:
       - Klasifikasi penyakit menggunakan ICD-10 dan ICD-9-CM
       - Pengkodean INA-CBG untuk klaim dan penilaian biaya pelayanan kesehatan
       - Penerapan clinical pathway dan evidence-based clinical guidelines
       - Penilaian tingkat keparahan kasus (severity level) secara objektif dan konsisten

      Tugas utama kamu adalah:
       - Melakukan analisis klinis berdasarkan data SOAP (Subjective, Objective, Assessment, Plan) yang tersedia
       - Menentukan diagnosis utama dan diagnosis sekunder sesuai ICD-10
       - Menentukan tindakan medis dan prosedur sesuai ICD-9-CM
       - Memberikan rekomendasi tindakan medis berdasarkan best practice
       - Menentukan kode INA-CBG yang sesuai berdasarkan diagnosis dan poli yang menangani

      KHUSUS UNTUK PENENTUAN KODE INACBG:
      - Analisis poli/spesialisasi yang menangani pasien
      - Cocokkan diagnosis utama dengan kategori INACBG yang sesuai
      - Berikan justifikasi mengapa kode tersebut dipilih
      - Pertimbangkan diagnosis sekunder untuk konfirmasi kode

      Prinsip utama:
      - Tidak membuat asumsi di luar data yang diberikan
      - Menggunakan terminologi medis standar dan valid
      - Menyampaikan output secara sistematis, ringkas, dan profesional
    `;

    const output = `
      {
        "ai_analysis_recommendations": {
          "diagnosis_primer": [
            {
              "kode": "A15.0",
              "nama": "Tuberkulosis paru, terkonfirmasi bakteriologis",
              "rekomendasi_ai": true,
              "confidence": 95,
              "alasan": "Diagnosis sudah terkonfirmasi bakteriologis dengan gejala klasik TBC",
              "inacbg": "A"
            },
            {
              "kode": "A15.9",
              "nama": "Tuberkulosis pernapasan tidak spesifik",
              "confidence": 80,
              "alasan": "Alternatif diagnosis TBC dengan presentasi tidak spesifik",
              "inacbg": "A"
            },
            {
              "kode": "J44.1",
              "nama": "Penyakit paru obstruktif kronik dengan eksaserbasi akut",
              "confidence": 60,
              "alasan": "Diagnosis diferensial pada batuk kronik",
              "inacbg": "J"
            }
          ],
          "diagnosis_sekunder": [
            {
              "kode": "R50.9",
              "nama": "Demam tidak spesifik",
              "rekomendasi_ai": true,
              "confidence": 85,
              "alasan": "Gejala sistemik yang sering menyertai TBC",
              "inacbg": "A"
            },
            {
              "kode": "R06.00",
              "nama": "Sesak napas",
              "confidence": 75,
              "alasan": "Komplikasi respirasi dari TBC paru",
              "inacbg": "J"
            },
            {
              "kode": "R63.4",
              "nama": "Penurunan berat badan abnormal",
              "rekomendasi_ai": true,
              "confidence": 90,
              "alasan": "Gejala konstitutional TBC yang signifikan",
              "inacbg": "A"
            }
          ],
          "tindakan_medis": [
            {
              "kode": "89.39",
              "nama": "Pemeriksaan laboratorium darah lengkap",
              "kategori": "Diagnostik",
              "rekomendasi_ai": true,
              "confidence": 95,
              "alasan": "Monitoring status infeksi dan respon terapi TBC",
              "inacbg": "A"
            },
            {
              "kode": "87.44",
              "nama": "Rontgen thorax",
              "kategori": "Radiologi",
              "rekomendasi_ai": true,
              "confidence": 98,
              "alasan": "Evaluasi lesi paru dan monitoring progresivitas TBC",
              "inacbg": "A"
            },
            {
              "kode": "90.05",
              "nama": "Tes HIV",
              "kategori": "Diagnostik",
              "rekomendasi_ai": true,
              "confidence": 90,
              "alasan": "Screening ko-infeksi HIV pada pasien TBC",
              "inacbg": "A"
            }
          ],
          "severity_level": 2,
          "severity_justifikasi": "Pasien dengan TBC paru terkonfirmasi, kondisi umum cukup baik namun memerlukan terapi intensif",
          "kode_inacbg_utama": "A",
          "justifikasi_inacbg": "TBC Paru adalah penyakit infeksi yang disebabkan Mycobacterium tuberculosis, masuk kategori A (Penyakit Infeksi dan Parasitik)",
          "resume_medis": true,
          "hasil_laboratorium": false,
          "hasil_radiologi": false,
          "lembar_observasi": false,
          "jenis_pelayanan": "Rawat Inap"
        }
      }
    `;

    const contextUser = `
      Berikut data pasien yang perlu dianalisis secara klinis:
        ${patientInfo}
      
      Berdasarkan data pasien di atas, buatlah ANALISIS dengan output yang memenuhi persyaratan berikut:
        
        1. Diagnosis Primer:
          - Tampilkan **tepat 3 diagnosis primer** yang paling relevan berdasarkan data klinis pasien.
          - Untuk setiap diagnosis, sertakan:
            * Kode ICD-10 yang akurat
            * Nama diagnosis lengkap
            * Flag "rekomendasi_ai": true (hanya untuk diagnosis yang paling direkomendasikan)
            * Confidence level (%)
            * Alasan medis yang jelas
            * Kode INACBG yang sesuai (A-Z) berdasarkan kategori penyakit

        2. Diagnosis Sekunder:
          - Tampilkan **tepat 3 diagnosis sekunder** yang relevan sebagai pendukung.
          - Format sama dengan diagnosis primer
          - Fokus pada gejala penyerta, komplikasi, atau kondisi komorbid

        3. Tindakan Medis:
          - Tampilkan tindakan yang benar-benar relevan berdasarkan poli dan kondisi pasien
          - Untuk setiap tindakan sertakan:
            * Kode tindakan (ICD-9-CM atau kode lokal)
            * Nama tindakan lengkap
            * Kategori (Diagnostik/Terapi/Radiologi/dll)
            * Flag "rekomendasi_ai": true (untuk tindakan prioritas)
            * Confidence level (%)
            * Alasan medis
            * Kode INACBG yang sesuai dengan tindakan tersebut

        4. Severity Level & INACBG:
          - Tentukan severity level (1-3) dengan justifikasi medis
          - **PENTING**: Tentukan kode INACBG utama (A-Z) berdasarkan:
            * Diagnosis utama pasien
            * Poli yang menangani
            * Kategori penyakit dominan
            * Berikan justifikasi mengapa kode tersebut dipilih
          - Checklist dokumen yang tersedia (✅/❌)

        5. Jenis Pelayanan:
          - Sesuai dengan input: "Rawat Jalan" atau "Rawat Inap"

        KHUSUS PENENTUAN KODE INACBG:
        - Analisis diagnosis utama dan cocokkan dengan kategori INACBG
        - Pertimbangkan poli spesialisasi yang menangani
        - Contoh: TBC Paru → Kategori A (Penyakit Infeksi), Hipertensi → Kategori I (Kardiovaskular)
        - Berikan justifikasi medis yang jelas untuk pemilihan kode

        Contoh format output: ${output}
        
        Buat analisis baru yang akurat berdasarkan data pasien yang diberikan. Pastikan kode INACBG sesuai dengan kondisi klinis dan kategori penyakit.
    `;

    const messages = [
      { role: "system", content: medicalSystemPrompt },
      { role: "system", content: inacbgSystemPrompt },
      { role: "user", content: contextUser }
    ];

    const completion = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('No content in AI response');
    }

    try {
      const cleaned = extractJsonFromContent(reply);
      const jsonResponse = JSON.parse(cleaned);
      
      const diagnosisPrimerCodes = jsonResponse.ai_analysis_recommendations.diagnosis_primer.map(item => item.kode);
      const diagnosisSekunderCodes = jsonResponse.ai_analysis_recommendations.diagnosis_sekunder.map(item => item.kode);
      const tindakanMedisCodes = jsonResponse.ai_analysis_recommendations.tindakan_medis.map(item => item.kode);

      const [tariffPrimerResults, tariffSekunderResults, tindakanResults] = await Promise.all([
        findInacbgByCodeDiagnosa(diagnosisPrimerCodes),
        findInacbgByCodeDiagnosa(diagnosisSekunderCodes),
        findInacbgByTindakanDiagnosa(tindakanMedisCodes)
      ]);

      const primerMapping = {};
      tariffPrimerResults.forEach(result => {
        primerMapping[result.diagnosa] = formatInacbgList([result]);
      });

      const sekunderMapping = {};
      tariffSekunderResults.forEach(result => {
        sekunderMapping[result.diagnosa] = formatInacbgList([result]);
      });

      const tindakanMapping = {};
      tindakanResults.forEach(result => {
        tindakanMapping[result.procedure] = formatInacbgList([result]);
      });

      // Add inacbgList to each diagnosis primer
      const enhancedDiagnosisPrimer = jsonResponse.ai_analysis_recommendations.diagnosis_primer.map(diagnosis => ({
        ...diagnosis,
        inacbgList: primerMapping[diagnosis.kode] || []
      }));

      // Add inacbgList to each diagnosis sekunder
      const enhancedDiagnosisSekunder = jsonResponse.ai_analysis_recommendations.diagnosis_sekunder.map(diagnosis => ({
        ...diagnosis,
        inacbgList: sekunderMapping[diagnosis.kode] || []
      }));

      // Add inacbgList to each tindakan medis
      const enhancedTindakanMedis = jsonResponse.ai_analysis_recommendations.tindakan_medis.map(tindakan => ({
        ...tindakan,
        inacbgList: tindakanMapping[tindakan.kode] || []
      }));

      // Build final response
      const finalResponse = {
          ai_analysis_recommendations: {
            ...jsonResponse.ai_analysis_recommendations,
            diagnosis_primer: enhancedDiagnosisPrimer,
            diagnosis_sekunder: enhancedDiagnosisSekunder,
            tindakan_medis: enhancedTindakanMedis
          }
      };

      return finalResponse;
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      console.error("Raw AI Reply content:", reply);
      throw new Error(`Response format tidak valid: ${jsonError.message}. Raw reply: ${reply}`);
    }

  } catch (error) {
    handleError('error', {
      type: error.name,
      message: error.message,
      stack: error.stack
    });

    throw `Error dalam proses rekomendasi AI: ${error.message}`;
  }  
}

const updateMRConso = async () => {
  try {
    const strMrconso = await getMrconsoStr();

    const medicalSystemPrompt = `
      Kamu adalah sistem pendukung keputusan klinis yang bertindak sebagai asisten dokter.
      Kamu memiliki keahlian tinggi dalam:
       - Klasifikasi penyakit menggunakan ICD-10 dan ICD-9-CM
       - Pengkodean INA-CBG untuk klaim dan penilaian biaya pelayanan kesehatan
       - Penerapan clinical pathway dan evidence-based clinical guidelines
       - Penilaian tingkat keparahan kasus (severity level) secara objektif dan konsisten

      Tugas utama kamu adalah:
       - Melakukan analisis klinis berdasarkan data SOAP (Subjective, Objective, Assessment, Plan) yang tersedia
       - Menentukan diagnosis utama dan diagnosis sekunder sesuai ICD-10
       - Menentukan tindakan medis dan prosedur sesuai ICD-9-CM
       - Memberikan rekomendasi tindakan medis berdasarkan best practice
       - Menentukan kode INA-CBG yang sesuai berdasarkan diagnosis dan poli yang menangani

      KHUSUS UNTUK PENENTUAN KODE INACBG:
      - Analisis poli/spesialisasi yang menangani pasien
      - Cocokkan diagnosis utama dengan kategori INACBG yang sesuai
      - Berikan justifikasi mengapa kode tersebut dipilih
      - Pertimbangkan diagnosis sekunder untuk konfirmasi kode

      Prinsip utama:
      - Tidak membuat asumsi di luar data yang diberikan
      - Menggunakan terminologi medis standar dan valid
      - Menyampaikan output secara sistematis, ringkas, dan profesional
    `;

    const outputFormat = `
      {
        str: "contoh_code", -> pada bagian ini penamaannya jangan kamu ubah ya sesuain aja sama inputannya str
        str_indo_list: "terjemahan_bahasa_indonesia"
      }
    `;

    const contextUser = `
      Berikut adalah daftar istilah medis yang belum memiliki terjemahan bahasa Indonesia.
      Mohon berikan terjemahan dalam bentuk array JSON seperti contoh format berikut:
      ${outputFormat}

      Data:
      str : ${JSON.stringify(strMrconso.map(item => ({ str: item.str })), null, 2)}
    `;

    const messages = [
      { role: "system", content: medicalSystemPrompt },
      { role: "user", content: contextUser }
    ];

    const completion = await aiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Tidak ada konten dari AI');
    }

    let parsed;
    try {
      const cleaned = extractJsonFromContent(content);
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error('Gagal parsing output AI ke JSON');
    }

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    await updateStrMRConso(parsed);

  } catch (error) {
    handleError('error', {
      type: error.name,
      message: error.message,
      stack: error.stack
    });

    throw `Error dalam proses rekomendasi AI: ${error.message}`;
  }  
}

const extractJsonFromContent = (content) => {
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : content.trim();
};


module.exports = {
  getRecommendation,
  getRecommendationV1,
  updateMRConso
};
