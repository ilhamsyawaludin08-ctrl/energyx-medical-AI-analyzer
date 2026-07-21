const { ApiResponse } = require('../utils/apiResponse');
const inacbgService = require("../services/inacbgService")
const handleError = require('../monitor/errorHandler');

exports.getInacbg = async (req, res) => {
    try {
        const result = await inacbgService.getInacbg(req)
        
        return new ApiResponse(res)
            .success('Daftar INA-CBG berhasil diambil')
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

exports.createInacbg = async (req, res) => {
    try {
        const result = await inacbgService.createInacbg(req)
        
        return new ApiResponse(res)
            .status(201)
            .success('Data INA-CBG berhasil dibuat')
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

exports.updateInacbg = async (req, res) => {
    try {
        const result = await inacbgService.updateInacbg(req)
        
        return new ApiResponse(res)
            .success('Data INA-CBG berhasil diperbarui')
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

exports.deleteInacbg = async (req, res) => {
    try {
        await inacbgService.deleteInacbg(req)
        
        return new ApiResponse(res)
            .success('Data INA-CBG berhasil dihapus')
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
