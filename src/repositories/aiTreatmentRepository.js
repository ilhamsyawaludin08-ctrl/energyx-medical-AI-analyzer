const { Op } = require('sequelize');
const { AiTreatment } = require("../models")
const { ApiResponse } = require('../utils/apiResponse');
const handleError = require('../monitor/errorHandler');

// ====================
// V0 Repository
// ====================

const save = async (analysis_id, result, options = {}) => {
    try {
        const transaction = options.transaction;
        const htmlToText = result.replace(/<br\s*\/?>/gi, '\n');

        const treatmentSection = htmlToText.split('TINDAKAN MEDIS')[1]?.split('SEVERITY LEVEL')[0] || '';

        const treatmentRegex = /-\s*([A-Z0-9\-]+)\s*-\s*(.+?)(\(REKOMENDASI AI\))?\s*\n\s*Kategori:\s*(.+?)\s*\n\s*Confidence:\s*(\d+)%\s*\n\s*Alasan:\s*(.+?)\s*\n\s*INACBG:\s*([A-Z0-9\-]+)\s*\nTarif:\s*(\d+)/gs;

        const matches = [...treatmentSection.matchAll(treatmentRegex)];

        const treatments = matches.map((match) => ({
            analysis_id,
            code: match[1]?.trim(),
            title: match[2]?.trim(),
            is_ai_recommendation: !!match[3],
            category: match[4]?.trim(),
            confidence: parseFloat(match[5]?.trim() || '0'),
            reason: match[6]?.trim(),
            inacbg: match[7]?.trim(),
            cost: parseInt(match[8], 10),
        }));

        if (treatments.length) {
            await AiTreatment.bulkCreate(treatments, { transaction });
        }
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
  
        throw error;
    }
}

const saveTreatment = async (analysis_id, treatment, options = {}) => {
    try {
        const transaction = options.transaction;
    
        for (const d of treatment) {
            await AiTreatment.create({
                analysis_id,
                code: d.code,
                title: d.title,
                is_ai_recommendation: d.is_ai_recommendation,
                is_selected: d.is_selected || false,
                category: d.category,
                confidence: d.confidence,
                reason: d.reason,
                inacbg: d.inacbg,
                cost: d.cost,
            }, { transaction });
        }
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
  
        throw error;
    }
}

// ====================
// V1 Repository
// ====================

const saveV1 = async (analysis_id, result, options = {}) => {
    try {
        const transaction = options.transaction;

        const matches = result.ai_analysis_recommendations.tindakan_medis;
        const treatments = matches.map((match) => ({
            analysis_id,
            code: match.kode,
            title: match.nama,
            is_ai_recommendation: match.rekomendasi_ai,
            category: match.kategori,
            confidence: match.confidence,
            reason: match.alasan,
            inacbg_list: JSON.stringify(match.inacbgList),
        }));

        if (treatments.length) {
            await AiTreatment.bulkCreate(treatments, { transaction });
        }
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
  
        throw error;
    }
}

module.exports = {
    save,
    saveTreatment,
    saveV1
}