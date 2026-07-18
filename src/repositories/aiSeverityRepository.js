const { Op } = require('sequelize');
const { AiSeverity } = require("../models")
const { ApiResponse } = require('../utils/apiResponse');
const handleError = require('../monitor/errorHandler');

// ====================
// V0 Service
// ====================

const save = async (analysis_id, result, options = {}) => {
    try {
        const transaction = options.transaction;
        const plainText = result.replace(/<br\s*\/?>/gi, '\n');

        const severityBlockMatch = plainText.match(/SEVERITY LEVEL\s*-\s*\d[\s\S]*?(?=JENIS PELAYANAN)/i);
        if (!severityBlockMatch) {
            throw new Error('SEVERITY LEVEL section not found');
        }

        const severityBlock = severityBlockMatch[0].trim();

        // Ambil level: angka setelah "SEVERITY LEVEL -"
        const levelMatch = severityBlock.match(/SEVERITY LEVEL\s*-\s*(\d+)/i);
        const level = levelMatch ? parseInt(levelMatch[1], 10) : null;

        // Ambil justifikasi & checklist
        let justification = '';
        const checklist = [];

        const lines = severityBlock.split('\n').map(line => line.trim());
        let isJustification = false;

        for (const line of lines) {
            if (/^- Justifikasi:/i.test(line)) {
                isJustification = true;
                justification = line.split(':').slice(1).join(':').trim();
                continue;
            }

            if (/^[✅❌]/.test(line)) {
                isJustification = false;
                checklist.push(line.trim());
                continue;
            }

            if (isJustification && line !== '') {
                justification += ' ' + line;
            }
        }

        // Hilangkan "- Checklist:" dari akhir justifikasi jika ada
        if (justification.toLowerCase().includes('- checklist:')) {
            justification = justification.split(/- checklist:/i)[0].trim();
        }

        await AiSeverity.create({
            analysis_id,
            level,
            justification,
            checklist: JSON.stringify(checklist),
        }, { transaction });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
  
        throw error;
    }
}

const saveSeverity = async (analysis_id, severity, options = {}) => {
    try {
        const transaction = options.transaction;

        return AiSeverity.create({
            analysis_id,
            level: severity.level,
            justification: severity.justification,
            checklist: JSON.stringify(severity.checklist)
        }, { transaction });
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
// V1 Service
// ====================

const saveV1 = async (analysis_id, result, options = {}) => {
    try {
        const transaction = options.transaction;

        const analysis = result.ai_analysis_recommendations
        await AiSeverity.create({
            analysis_id,
            level: analysis.severity_level,
            justification: analysis.justifikasi_inacbg,
            checklist: JSON.stringify({
                resume_medis : analysis.resume_medis,
                hasil_laboratorium : analysis.hasil_laboratorium,
                hasil_radiologi : analysis.hasil_radiologi,
                lembar_observasi : analysis.lembar_observasi
            }),
        }, { transaction });
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
    saveSeverity,
    saveV1
}