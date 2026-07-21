const Joi = require('joi');

// Skema untuk document checklist yang lebih fleksibel
const documentChecklistSchema = Joi.object({
  has_medical_resume: Joi.boolean().default(false).messages({
    'boolean.base': 'has_medical_resume harus berupa boolean'
  }),
  has_lab_results: Joi.boolean().default(false).messages({
    'boolean.base': 'has_lab_results harus berupa boolean'
  }),
  has_imaging: Joi.boolean().default(false).messages({
    'boolean.base': 'has_imaging harus berupa boolean'
  }),
  has_specialist_consultation: Joi.boolean().default(false).messages({
    'boolean.base': 'has_specialist_consultation harus berupa boolean'
  }),
  has_iv_therapy_proof: Joi.boolean().default(false).messages({
    'boolean.base': 'has_iv_therapy_proof harus berupa boolean'
  }),
  has_daily_care_notes: Joi.boolean().default(false).messages({
    'boolean.base': 'has_daily_care_notes harus berupa boolean'
  }),
  has_min_5day_inpatient: Joi.boolean().default(false).messages({
    'boolean.base': 'has_min_5day_inpatient harus berupa boolean'
  }),
  severity_level: Joi.alternatives().try(
    Joi.string().valid('I', 'II', 'III'),
    Joi.number().valid(1, 2, 3)
  ).required().messages({
    'alternatives.match': 'severity_level harus berupa string (I, II, III) atau angka (1, 2, 3)',
    'any.required': 'severity_level diperlukan'
  })
}).unknown(false);

// Skema untuk transaksi BPJS
const createTransactionSchema = Joi.object({
  patient_name: Joi.string().max(100).required().messages({
    'string.empty': 'Nama pasien diperlukan',
    'string.max': 'Nama pasien tidak boleh melebihi 100 karakter',
    'string.base': 'Nama pasien harus berupa string',
  }),
  primary_diagnosis: Joi.string().required().messages({
    'string.base': 'Primary diagnosis harus berupa string',
    'any.required': 'Primary diagnosis diperlukan'
  }),
  secondary_diagnosis: Joi.array().items(
    Joi.string()
  ).messages({
    'array.base': 'Secondary diagnosis harus berupa array',
    'string.base': 'ID secondary diagnosis harus berupa string'
  }),
  document_checklist: documentChecklistSchema.required().messages({
    'any.required': 'Document checklist diperlukan'
  }),
  notes: Joi.string().allow('', null).messages({
    'string.base': 'Catatan harus berupa string',
  }),
  encounter_number: Joi.string().allow('', null),
  treatment: Joi.array().items(Joi.object().unknown(true)).allow(null)
});

module.exports = {
  createTransactionSchema,
};