const { TransactionBpjsHasDiagnosis } = require('../models');

const create = async (data) => {
  return TransactionBpjsHasDiagnosis.create(data);
};

module.exports = {
    create
}