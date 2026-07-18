const diagnosisService = require("../services/diagnosisService")
const aiAnalysisService = require('../services/aiAnalysisService')
const AiDiagnosisService = require('../services/aiDiagnosisService')
const AiTreatmentService = require('../services/aiTreatmentService')
const AiSeverityService = require('../services/aiSeverityService')
const { ApiResponse } = require('../utils/apiResponse');
const { sequelize } = require('../config/database')
const handleError = require('../monitor/errorHandler');

exports.getAllDiagnosis = async (req, res) => {
    try {
        const { diagnosis } = req.query;
        const result = await diagnosisService.filterDiagnosis(diagnosis);
     
        return new ApiResponse(res)
            .success('Daftar diagnosa berhasil diambil')
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

exports.recomendation = async (req, res) => {
    try {
        const { condition } = req.body;
        console.log('Input data pasien:', condition);

        const result = await diagnosisService.recomendation(condition);

        const analysis = await sequelize.transaction(async (t) => {
            const analysis = await aiAnalysisService.save(condition, result, { transaction: t });
            await AiDiagnosisService.save(analysis.id, result, { transaction: t });
            await AiTreatmentService.save(analysis.id, result, { transaction: t });
            await AiSeverityService.save(analysis.id, result, { transaction: t });
            
            return analysis
        });
        
        return res.status(200).json({ 
            status: 200,
            message: `Berhasil`,
            data: analysis,
         });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({ 
            status: 500,
            message: `Gagal: ${error.message}` });
    }
}

exports.recomendationV1 = async (req, res) => {
    try {

        const input = req.body
        
        const result = await diagnosisService.recomendationV1(input);

        await sequelize.transaction(async (t) => {
            const analysis = await aiAnalysisService.saveV1(input, result, { transaction: t }, input.doctor_code, req.headers['x-hospital-code']);
            await AiDiagnosisService.saveV1(analysis.id, result, { transaction: t });
            await AiTreatmentService.saveV1(analysis.id, result, { transaction: t });
            await AiSeverityService.saveV1(analysis.id, result, { transaction: t });
        });

        return res.status(200).json({ 
            status: 200,
            message: `Berhasil`,
            data: result,
         });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({ 
            status: 500,
            message: `Gagal: ${error.message}` });
    }
}

exports.updateMrconso = async (req, res) => {
    try {
        const result = await diagnosisService.updateMRConso();
        
        return res.status(200).json({ 
            status: 200,
            message: `Berhasil`,
            data: result,
         });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({ 
            status: 500,
            message: `Gagal: ${error.message}` });
    }
}