// services/transactionService.js
const { ApiError } = require('../utils/apiError');
const transactionBPJSRepository = require('../repositories/transactionBPJSRepository');
const masterDiagnosisRepository = require("../repositories/masterDiagnosisRepository");
const transactionBPJSHasDiagnosisRepository = require("../repositories/transactionBPJSHasDiagnosisRepository");
const transactionBPJSDocumentRepository = require("../repositories/transactionBPJSDocumentRepository");
const moment = require('moment');

const SEVERITY_COSTS = {
  1: 3000000, // Level 1 - paling parah
  2: 2000000, // Level 2 - sedang
  3: 1000000, // Level 3 - ringan
};

const createTransaction = async (data) => {
  try {
    // Validasi primary diagnosis
    const primaryDiagnosis = await masterDiagnosisRepository.findById(data.primary_diagnosis);
    if (!primaryDiagnosis) {
      throw new ApiError(404, `Primary diagnosis dengan ID ${data.primary_diagnosis} tidak ditemukan`);
    }

    // Validasi secondary diagnosis jika ada
    if (data.secondary_diagnosis && Array.isArray(data.secondary_diagnosis)) {
      for (const diagnosisId of data.secondary_diagnosis) {
        const secondaryDiagnosis = await masterDiagnosisRepository.findById(diagnosisId);
        if (!secondaryDiagnosis) {
          throw new ApiError(404, `Secondary diagnosis dengan ID ${diagnosisId} tidak ditemukan`);
        }
      }
    }

    // Ambil nilai claim dari primary diagnosis
    const claimAmount = primaryDiagnosis.claim || 0;
    
    // Hitung biaya berdasarkan level (asumsi level ada dalam data)
    const severityLevel = data.document_checklist.severity_level || 1;

    let costAmount = 0;
    if (severityLevel === 1) {
      costAmount = SEVERITY_COSTS[1];
    } else if (severityLevel === 2) {
      costAmount = SEVERITY_COSTS[2];
    } else if (severityLevel === 3) {
      costAmount = SEVERITY_COSTS[3];
    } else {
      costAmount = SEVERITY_COSTS[1];
    }

    // Hitung profit
    const profitAmount = claimAmount - costAmount;
    
    // Buat transaksi
    const transaction = await transactionBPJSRepository.create({
      ...data,
      status: 'selesai',
      document_status: data.document_checklist.has_medical_resume == true ? 'lengkap' : 'tidak lengkap',
      coverage_amount: claimAmount,
      cost_amount: costAmount,
      profit_amount: profitAmount,
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