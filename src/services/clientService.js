const clientRepository = require("../repositories/clientRepository");

const save = async (data) => {
  try {
    const res = await clientRepository.save(data);
    return res;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

module.exports = { 
    save,
};