const inacbgRepository = require("../repositories/inacbgRepository");

const getInacbg = async (req) => {
  try {
    return await inacbgRepository.getInacbg(req);
  } catch (err) {
    console.error("Error in getInacbg service:", err);
    throw err;
  }
}

const createInacbg = async (req) => {
  try {
    return await inacbgRepository.createInacbg(req.body);
  } catch (err) {
    console.error("Error in createInacbg service:", err);
    throw err;
  }
}

const updateInacbg = async (req) => {
  try {
    const inacbgCode = req.params.inacbg;
    return await inacbgRepository.updateInacbg(inacbgCode, req.query, req.body);
  } catch (err) {
    console.error("Error in updateInacbg service:", err);
    throw err;
  }
}

const deleteInacbg = async (req) => {
  try {
    const inacbgCode = req.params.inacbg;
    return await inacbgRepository.deleteInacbg(inacbgCode, req.query);
  } catch (err) {
    console.error("Error in deleteInacbg service:", err);
    throw err;
  }
}

module.exports = {
  getInacbg,
  createInacbg,
  updateInacbg,
  deleteInacbg
}
