const aiSeverityRepository = require("../repositories/aiSeverityRepository");

// ====================
// V0 Service
// ====================

const save = async (analysis_id, result, options = {}) => {
  try {
    const data = await aiSeverityRepository.save(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

const saveSeverity = async (analysis_id, severity, options = {}) => {
  try {
    const data = await aiSeverityRepository.saveSeverity(analysis_id, severity, options);
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
    const data = await aiSeverityRepository.saveV1(analysis_id, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

module.exports = { 
    save,
    saveSeverity,
    saveV1,
};