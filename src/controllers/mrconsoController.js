const { ApiResponse } = require('../utils/apiResponse');
const mrconsoService = require("../services/mrconsoService")
const handleError = require('../monitor/errorHandler');

exports.getMrconso = async (req, res) => {
    try {
        const result = await mrconsoService.getMrconso(req)
        
        return new ApiResponse(res)
            .success('Daftar mrconso berhasil diambil')
            .data(result)
            .send();
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
        
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}

exports.getMrconsoIndo = async (req, res) => {
    try {
        const result = await mrconsoService.getMrconsoIndo(req)
        
        return new ApiResponse(res)
            .success('Daftar mrconso berhasil diambil')
            .data(result)
            .send();
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
        
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}