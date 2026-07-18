const aiTreatmentRepository = require("../repositories/aiTreatmentRepository");

// ====================
// V0 Service
// ====================

const save = async (analysis_id, result, options = {}) => {
  try {
    const data = await aiTreatmentRepository.save(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

const saveTreatment = async (analysis_id, treatment, options = {}) => {
  try {
    const data = await aiTreatmentRepository.saveTreatment(analysis_id, treatment, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

// ====================
// V1 Service
// ====================

const saveV1 = async (analysis_id, result, options = {}) => {
  try {
    const data = await aiTreatmentRepository.saveV1(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

module.exports = { 
    save,
    saveTreatment,
    saveV1,
};