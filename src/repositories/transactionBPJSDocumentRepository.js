const { TransactionBpjsDocument } = require('../models');

const create = async (data) => {
  return TransactionBpjsDocument.create(data);
};

module.exports = {
    create
}