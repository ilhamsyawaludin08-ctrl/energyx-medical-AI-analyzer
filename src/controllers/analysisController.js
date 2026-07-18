const { ApiResponse } = require('../utils/apiResponse');
const aiAnalysisService = require('../services/aiAnalysisService')
const MrconsoService = require('../services/mrconsoService')
const handleError = require('../monitor/errorHandler');

exports.getAllEncounter = async (req, res) => {
    try {
        const result = await aiAnalysisService.getAll(req.query);
     
        return new ApiResponse(res)
            .success('Daftar layanan berhasil diambil')
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

exports.getByEncounter = async (req, res) => {
    try {
        const { encounterNumber } = req.params

        const aiAnalysis = await aiAnalysisService.getByEncounter(encounterNumber)
        
        return new ApiResponse(res)
            .success('Detail layanan berhasil diambil')
            .data(aiAnalysis)
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