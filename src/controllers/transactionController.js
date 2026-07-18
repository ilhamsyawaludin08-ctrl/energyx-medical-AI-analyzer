const transactionService = require('../services/transactionService');
const { ApiError } = require('../utils/apiError');
const { ApiResponse } = require('../utils/apiResponse');

exports.createTransaction = async (req, res) => {
    try {
        const transactionData = req.body;
        const result = await transactionService.createTransaction(transactionData);
        
        return new ApiResponse(res)
            .success('Transaksi BPJS berhasil dibuat')
            .data(result)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
};

/**
 * Get all transactions with pagination and filtering
 * @route GET /api/transactions
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'created_at', 
            sortOrder = 'DESC',
            status,
            startDate,
            endDate,
            search
        } = req.query;
        
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sortBy,
            sortOrder,
            status,
            startDate,
            endDate,
            search
        };
        
        const result = await transactionService.getAllTransactions(options);
        
        return new ApiResponse(res)
            .success('Daftar transaksi BPJS berhasil diambil')
            .data(result.data)
            .pagination(result.pagination)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
};

/**
 * Get transaction by ID
 * @route GET /api/transactions/:id
 */
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await transactionService.getTransactionById(id);
        
        if (!result) {
            throw new ApiError(404, 'Transaksi tidak ditemukan');
        }
        
        return new ApiResponse(res)
            .success('Detail transaksi BPJS berhasil diambil')
            .data(result)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
};
