// services/transactionService.js
const { ApiError } = require('../utils/apiError');
const transactionBPJSRepository = require('../repositories/transactionBPJSRepository');
const masterDiagnosisRepository = require("../repositories/masterDiagnosisRepository");
const transactionBPJSHasDiagnosisRepository = require("../repositories/transactionBPJSHasDiagnosisRepository");
const transactionBPJSDocumentRepository = require("../repositories/transactionBPJSDocumentRepository");
const { AiAnalysis, AiDiagnosis, AiSeverity, AiTreatment } = require('../models');
const moment = require('moment');

const SEVERITY_COSTS = {
  1: 3000000, // Level 1 - paling parah
  2: 2000000, // Level 2 - sedang
  3: 1000000, // Level 3 - ringan
};

const createTransaction = async (data) => {
  try {
    // Validasi & Resolve primary diagnosis (dari string code misal 'A15.0' ke integer ID MasterDiagnosis)
    const primaryDiagnosis = await masterDiagnosisRepository.findOrCreateByCode(data.primary_diagnosis);
    if (!primaryDiagnosis) {
      throw new ApiError(404, `Primary diagnosis dengan kode ICD-10 ${data.primary_diagnosis} tidak ditemukan`);
    }
    // Ganti string code menjadi integer ID agar sesuai struktur database
    data.primary_diagnosis = primaryDiagnosis.id;

    // Validasi & Resolve secondary diagnosis jika ada
    if (data.secondary_diagnosis && Array.isArray(data.secondary_diagnosis)) {
      const resolvedSecondaryIds = [];
      for (const diagnosisCode of data.secondary_diagnosis) {
        const secondaryDiagnosis = await masterDiagnosisRepository.findOrCreateByCode(diagnosisCode);
        if (!secondaryDiagnosis) {
          throw new ApiError(404, `Secondary diagnosis dengan kode ICD-10 ${diagnosisCode} tidak ditemukan`);
        }
        resolvedSecondaryIds.push(secondaryDiagnosis.id);
      }
      data.secondary_diagnosis = resolvedSecondaryIds;
    }

    // Hitung biaya treatment murni (tanpa biaya dasar dummy)
    let treatmentCost = 0;
    if (data.treatment && Array.isArray(data.treatment)) {
      treatmentCost = data.treatment.filter(t => t.is_selected).reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);
    }

    const totalCost = treatmentCost;

    // Plafon BPJS diset 0 (karena belum ada grouper)
    const claimAmount = 0;

    // Hitung profit diset 0
    const profitAmount = 0;
    
    // Buat transaksi
    const transaction = await transactionBPJSRepository.create({
      ...data,
      status: 'selesai',
      document_status: data.document_checklist.has_medical_resume == true ? 'lengkap' : 'tidak lengkap',
      coverage_amount: claimAmount,
      cost_amount: totalCost,
      profit_amount: profitAmount,
      created_by: data.user_id || 1,
      transaction_date: moment().format('YYYY-MM-DD')
    });

    // Tambahkan primary diagnosis ke tabel relasi juga
    await transactionBPJSHasDiagnosisRepository.create({
      transaction_bpjs_id: transaction.id,
      diagnosis_master_id: data.primary_diagnosis,
      is_primary: true
    });

    // Tambahkan secondary diagnosis ke tabel relasi jika ada
    if (data.secondary_diagnosis && Array.isArray(data.secondary_diagnosis)) {
      await Promise.all(data.secondary_diagnosis.map(async (diagnosisId) => {
        await transactionBPJSHasDiagnosisRepository.create({
          transaction_bpjs_id: transaction.id,
          diagnosis_master_id: diagnosisId,
          is_primary: false
        });
      }));
    }

    // Tambahkan document checklist jika ada
    if (data.document_checklist) {
      await transactionBPJSDocumentRepository.create({
        transaction_bpjs_id: transaction.id,
        ...data.document_checklist
      });
    }

    // Ambil transaksi lengkap dengan relasi untuk return
    const completeTransaction = await transactionBPJSRepository.findById(transaction.id);
    
    // UPDATE AiAnalysis related records so it persists in the Encounter view
    try {
      if (data.encounter_number) {
        const analysis = await AiAnalysis.findOne({ where: { encounter_number: data.encounter_number } });
        if (analysis) {
          // Update Diagnosis
          await AiDiagnosis.destroy({ where: { analysis_id: analysis.id } });
          await AiDiagnosis.create({
            analysis_id: analysis.id,
            is_primary: true,
            code: primaryDiagnosis.icd10_code,
            title: primaryDiagnosis.disease_name,
            is_ai_recommendation: false,
            is_selected: true
          });
          if (data.secondary_diagnosis && Array.isArray(data.secondary_diagnosis)) {
            for (const diagnosisId of data.secondary_diagnosis) {
              const secDiag = await masterDiagnosisRepository.findById(diagnosisId);
              if (secDiag) {
                await AiDiagnosis.create({
                  analysis_id: analysis.id,
                  is_primary: false,
                  code: secDiag.icd10_code,
                  title: secDiag.disease_name,
                  is_ai_recommendation: false,
                  is_selected: true
                });
              }
            }
          }
          
          // Update Severity
          await AiSeverity.destroy({ where: { analysis_id: analysis.id } });
          const checklistObj = {
            resume_medis: !!data.document_checklist.has_medical_resume,
            hasil_laboratorium: !!data.document_checklist.has_lab_results,
            hasil_radiologi: !!data.document_checklist.has_imaging,
            lembar_observasi: !!data.document_checklist.has_daily_care_notes
          };
          await AiSeverity.create({
            analysis_id: analysis.id,
            level: severityLevel,
            justification: data.notes || "Divalidasi oleh dokter",
            checklist: JSON.stringify(checklistObj)
          });
          
          // Update Treatment
          if (data.treatment && Array.isArray(data.treatment)) {
            await AiTreatment.destroy({ where: { analysis_id: analysis.id } });
            for (const treat of data.treatment) {
              await AiTreatment.create({
                 analysis_id: analysis.id,
                 code: treat.code || treat.kode_tindakan,
                 title: treat.title || treat.deskripsi_tindakan,
                 is_selected: true
              });
            }
          }
        }
      }
    } catch (updateErr) {
      console.error("Failed to update AiAnalysis records:", updateErr);
    }

    return completeTransaction;
    
  } catch (error) {
    throw new ApiError(400, `Gagal membuat transaksi: ${error.message}`);
  }
};

const getAllTransactions = async (options) => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'DESC';
    
    // Build where clause
    const whereClause = {};
    
    if (options.status) whereClause.status = options.status;
    
    if (options.startDate && options.endDate) {
      whereClause.tanggal_transaksi = { [Op.between]: [options.startDate, options.endDate] };
    } else if (options.startDate) {
      whereClause.tanggal_transaksi = { [Op.gte]: options.startDate };
    } else if (options.endDate) {
      whereClause.tanggal_transaksi = { [Op.lte]: options.endDate };
    }
    
    if (options.search) {
      whereClause[Op.or] = [
        { pasien: { [Op.like]: `%${options.search}%` } },
        { nama: { [Op.like]: `%${options.search}%` } },
        { diagnosa_utama: { [Op.like]: `%${options.search}%` } }
      ];
    }
    
    // Get total count
    const count = await transactionBPJSRepository.count(whereClause);
    
    // Get transactions
    const transactions = await transactionBPJSRepository.findAll(whereClause, {
      limit, offset, sortBy, sortOrder
    });
    
    return {
      data: transactions,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    throw new ApiError(500, `Gagal mengambil data transaksi: ${error.message}`);
  }
};

const getTransactionById = async (id) => {
  try {
    const transaction = await transactionBPJSRepository.findById(id);
    if (!transaction) throw new ApiError(404, 'Transaksi tidak ditemukan');
    return transaction;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Gagal mengambil detail transaksi: ${error.message}`);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById
};