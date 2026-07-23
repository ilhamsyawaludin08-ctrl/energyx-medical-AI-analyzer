// validation/diagnosisValidation.js
const Joi = require('joi');

// Validation schema for the condition object
const conditionSchema = Joi.object({
  TD: Joi.string().optional().description('Blood pressure in format: 120/80 mmHg'),
  N: Joi.string().optional().description('Heart rate in format: 80 x/mnt'),
  RR: Joi.string().optional().description('Respiratory rate in format: 20 x/mnt'),
  BB: Joi.string().optional().description('Body weight in format: 65 kg'),
  TB: Joi.string().optional().description('Height in format: 170 cm'),
  S: Joi.string().optional().description('Temperature in format: 36.5°C'),
  SPO2: Joi.string().optional().description('Oxygen saturation in format: 98%')
}).optional();

// Main validation schema for recommendation request
const recommendationSchema = Joi.object({
  patient_id: Joi.alternatives()
    .try(
      Joi.string().min(1).max(50),
      Joi.number().integer().positive()
    )
    .required()
    .description('Patient ID - can be string or number'),
    
  encounter_number: Joi.string()
    .min(1)
    .max(50)
    .required()
    .description('Encounter number for this visit'),
    
  unit: Joi.string()
    .min(1)
    .max(100)
    .required()
    .description('Medical unit/department (e.g., Poli Anak)'),
    
  patient_name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .description('Patient full name'),
    
  gender: Joi.string()
    .valid('Laki-laki', 'Perempuan', 'Laki - Laki', 'Perempuan - Perempuan', 'L', 'P', 'Male', 'Female')
    .optional()
    .description('Patient gender'),
    
  age: Joi.number()
    .integer()
    .min(0)
    .max(150)
    .optional()
    .description('Patient age in years'),
    
  weight: Joi.number()
    .positive()
    .max(1000)
    .optional()
    .description('Patient weight in kg'),
    
  subjective: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .description('Subjective findings - patient complaints'),
    
  objective: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .description('Objective findings - physical examination'),
    
  assesment: Joi.string()
    .min(1)
    .max(500)
    .required()
    .description('Medical assessment/diagnosis'),
    
  creator: Joi.string()
    .min(1)
    .max(100)
    .required()
    .description('Creator of the record'),
    
  service_type: Joi.string()
    .valid('Rawat Jalan', 'Rawat Inap', 'IGD', 'Emergency', 'Outpatient', 'Inpatient')
    .required()
    .description('Type of medical service'),
    
  doctor_code: Joi.string().optional(),
  
  condition: conditionSchema
});

module.exports = {
  recommendationSchema,
  conditionSchema
};
