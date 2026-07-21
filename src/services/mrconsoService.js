const mrconsoRepository = require("../repositories/mrconsoRepository");

const getTreatment = async (req) => {
  try {
    const data = await mrconsoRepository.getTreatment(req);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const getDiagnosis = async (req) => {
  try {
    const data = await mrconsoRepository.getDiagnosis(req);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const getMrconso = async (req) => {
  try {
    const data = await mrconsoRepository.getMrconso(req);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const getMrconsoIndo = async (req) => {
  try {
    const data = await mrconsoRepository.getMrconsoIndo(req);
    return data;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const createMrconso = async (req) => {
  try {
    return await mrconsoRepository.createMrconso(req.body);
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const updateMrconso = async (req) => {
  try {
    const code = req.params.code;
    return await mrconsoRepository.updateMrconso(code, req.body);
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

const deleteMrconso = async (req) => {
  try {
    const code = req.params.code;
    return await mrconsoRepository.deleteMrconso(code);
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

module.exports = { 
  getTreatment,
  getDiagnosis,
  getMrconso,
  getMrconsoIndo,
  createMrconso,
  updateMrconso,
  deleteMrconso
};