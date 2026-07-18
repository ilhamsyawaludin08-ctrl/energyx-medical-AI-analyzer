// const Fuse = require("fuse.js");
// const masterIcd10Repository = require("../repositories/masterIcd10Repository");
const masterDiagnosisRepository = require("../repositories/masterDiagnosisRepository");
const aIService = require("./aIService");


const filterDiagnosis = async (diagnose) => {
  try {
    const records = await masterDiagnosisRepository.findAllByDiagnosis(diagnose);
    return records;
  } catch (err) {
    console.error("Error getting AI recommendations:", err);
    throw err;
  }
};

const recomendation = async (input) => {
  try {
    const aiResult = await aIService.getRecommendation(input);

    return aiResult;
  } catch (err) {
    console.error("Error getting AI recommendations:", err);
    throw err;
  }
}

const recomendationV1 = async (input) => {
  try {
    if (!input) {
      throw new Error('Input data tidak valid atau kosong');
    }

    const aiResult = await aIService.getRecommendationV1(input);

    return aiResult;
  } catch (err) {
    console.error("Error getting AI recommendations:", err);
    throw err;
  }
}

const updateMRConso = async () => {
  try {
    const aiResult = await aIService.updateMRConso();
    return aiResult;
  } catch (err) {
    console.error("Error getting AI recommendations:", err);
    throw err;
  }
}

module.exports = { 
    filterDiagnosis,
    recomendation,
    recomendationV1,
    updateMRConso,
};
