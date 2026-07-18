const aiDiagnosisRepository = require("../repositories/aiDiagnosisRepository");

// ====================
// V0 Service
// ====================

const save = async (analysis_id, result, options = {}) => {
  try {
    const data = await aiDiagnosisRepository.save(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

const saveDiagnosis = async (analysis_id, diagnosis, options = {}) => {
  try {
    const data = await aiDiagnosisRepository.saveDiagnosis(analysis_id, diagnosis, options);
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
    const data = await aiDiagnosisRepository.saveV1(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

module.exports = { 
    save,
    saveDiagnosis,
    saveV1,
};