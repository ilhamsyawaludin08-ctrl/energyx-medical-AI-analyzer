const { Op } = require('sequelize');
const { AiDiagnosis } = require("../models");
const { options } = require('joi');
const { ApiResponse } = require('../utils/apiResponse');
const handleError = require('../monitor/errorHandler');

// ====================
// V0 Repository
// ====================

const save = async (analysis_id, result, options = {}) => {
    try {
      const transaction = options.transaction;
      const text = result.replace(/<br\s*\/?>/gi, '\n');

      const primarySection = text.split('DIAGNOSIS PRIMER')[1]?.split('DIAGNOSIS SEKUNDER')[0] || '';
      const secondarySection = text.split('DIAGNOSIS SEKUNDER')[1]?.split('TINDAKAN MEDIS')[0] || '';

      const diagnosisRegex = /-\s*(.+?)\s*-\s*(.+?)(\(REKOMENDASI AI\))?\s*\n\s*Confidence:\s*(\d+)%\s*\n\s*Alasan:\s*(.+?)\s*(?=\n-|$)/gs;

      const extractDiagnoses = (section, isPrimary) => {
        const matches = [...section.matchAll(diagnosisRegex)];
        return matches.map((match) => ({
          analysis_id,
          is_primary: isPrimary,
          code: match[1]?.trim(),
          title: match[2]?.trim(),
          is_ai_recommendation: !!match[3],
          confidence: parseFloat(match[4]?.trim() || '0'),
          reason: match[5]?.trim(),
        }));
      };
    
      const diagnoses = [
        ...extractDiagnoses(primarySection, true),
        ...extractDiagnoses(secondarySection, false),
      ];
    
      if (diagnoses.length) {
        await AiDiagnosis.bulkCreate(diagnoses, { transaction });
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

const saveDiagnosis = async (analysis_id, diagnosis, options = {}) => {
    try {
      const transaction = options.transaction;
    
      for (const d of diagnosis) {
          await AiDiagnosis.create({
            analysis_id,
            is_primary: d.is_primary,
            code: d.code,
            title: d.title,
            is_ai_recommendation: d.is_ai_recommendation,
            is_selected: d.is_selected || false,
            confidence: d.confidence,
            reason: d.reason,
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
      const primarySection = result.ai_analysis_recommendations.diagnosis_primer
      const secondarySection = result.ai_analysis_recommendations.diagnosis_sekunder

      const extractDiagnoses = (section, isPrimary) => {
        return section.map((match) => ({
          analysis_id,
          is_primary: isPrimary,
          code: match.kode,
          title: match.nama,
          is_ai_recommendation: match.rekomendasi_ai,
          confidence: match.confidence,
          reason: match.alasan,
          inacbg_list: JSON.stringify(match.inacbgList),
        }));
      };
    
      const diagnoses = [
        ...extractDiagnoses(primarySection, true),
        ...extractDiagnoses(secondarySection, false),
      ];

    if (diagnoses.length) {
      await AiDiagnosis.bulkCreate(diagnoses, { transaction });
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
    saveDiagnosis,
    saveV1
}