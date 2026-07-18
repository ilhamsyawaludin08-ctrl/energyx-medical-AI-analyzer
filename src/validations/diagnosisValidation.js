const Joi = require('joi');
// Validasi untuk mengirim pesan dengan file
const diagnosisSchema = Joi.object({
  diagnosis: Joi.string().required().messages({
    'string.empty': 'Primer Diagnosis is required',
    'string.base': 'Caption must be a string',
  }),
});

module.exports = {
  diagnosisSchema,
};
