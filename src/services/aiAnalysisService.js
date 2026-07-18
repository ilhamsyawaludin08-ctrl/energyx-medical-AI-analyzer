const aiAnalysisRepository = require("../repositories/aiAnalysisRepository");

// ====================
// V0 Service
// ====================

const save = async (condition, result, options = {}) => {
  try {
    const data = await aiAnalysisRepository.save(condition, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};



const saveAnalysis = async (analysis, body, options = {}) => {
  try {
    const data = await aiAnalysisRepository.saveAnalysis(analysis, body, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

const get = async (id) => {
  try {
    const data = await aiAnalysisRepository.get(id);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const getAll = async (query) => {
  try {
    const limit = parseInt(query.limit, 10) || 10;
    const offset = parseInt(query.offset, 10) || 0;
    const search = typeof query.search === "string" ? query.search.trim() : "";

    const data = await aiAnalysisRepository.getAll({ search, limit, offset });
    
    return data
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const getByEncounter = async (encounterNumber) => {
  try {
    const data = await aiAnalysisRepository.getByEncounter(encounterNumber);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

// ====================
// V1 Service
// ====================

const saveV1 = async (input, result, options = {}) => {
  try {
    const data = await aiAnalysisRepository.saveV1(input, result, options);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

module.exports = { 
    save,
    saveAnalysis,
    get,
    getAll,
    getByEncounter,
    saveV1
};