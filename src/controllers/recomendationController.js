const diagnosisService = require("../services/diagnosisService")
const aiAnalysisService = require('../services/aiAnalysisService')
const AiDiagnosisService = require('../services/aiDiagnosisService')
const AiTreatmentService = require('../services/aiTreatmentService')
const AiSeverityService = require('../services/aiSeverityService')
const MrconsoService = require('../services/mrconsoService')
const { ApiResponse } = require('../utils/apiResponse');
const { sequelize } = require('../config/database')
const handleError = require('../monitor/errorHandler');

exports.getRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const aiAnalysis = await aiAnalysisService.get(id);
        const icd9 = await MrconsoService.getTreatment(req);
        const icd10 = await MrconsoService.getDiagnosis(req);
     
        const recommendedDiagnosis = aiAnalysis.flatMap(r => r.diagnosis);
        const recommendedCodes = new Set(recommendedDiagnosis.map(d => d.code));
        const remainingDiagnosis = icd10.data.filter(d => !recommendedCodes.has(d.code));
        const mergedDiagnosis = [...recommendedDiagnosis, ...remainingDiagnosis];

        const recommendedTreatment = aiAnalysis.flatMap(r => r.treatment);
        const recommendedCodesTreatment = new Set(recommendedTreatment.map(d => d.code));
        const remainingTreatment = icd9.data.filter(d => !recommendedCodesTreatment.has(d.code));
        const mergedTreatment = [...recommendedTreatment, ...remainingTreatment];

        return new ApiResponse(res)
            .success('Daftar recommendation berhasil diambil')
            .data({
                recommendation: aiAnalysis,
                diagnosis: {
                    data: mergedDiagnosis,
                    total: icd10.total,
                    currentPage: icd10.currentPage,
                    totalPages: icd10.totalPages
                },
                treatment: {
                    data: mergedTreatment,
                    total: icd9.total,
                    currentPage: icd9.currentPage,
                    totalPages: icd9.totalPages
                }
            })
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

exports.saveRecommendation = async (req, res) => {
    try {
        const { body } = req.body
        const {
            analysis,
            diagnosis,
            treatment,
            severity
        } = body

        const dataAnalysis = await sequelize.transaction(async (t) => {
            const dataAnalysis = await aiAnalysisService.saveAnalysis(analysis, body, { transaction: t })
            await AiDiagnosisService.saveDiagnosis(dataAnalysis.id, diagnosis, { transaction: t })
            await AiTreatmentService.saveTreatment(dataAnalysis.id, treatment, { transaction: t })
            await AiSeverityService.saveSeverity(dataAnalysis.id, severity, { transaction: t })

            return dataAnalysis;
        });

        const aiAnalysis = await aiAnalysisService.get(dataAnalysis.id)

        return res.status(200).json({ 
            status: 200,
            message: `Berhasil`,
            data: aiAnalysis
        });
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
