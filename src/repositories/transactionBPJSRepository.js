const { 
  TransactionBpjs, 
  TransactionBpjsDocument, 
  MasterDiagnosis
} = require('../models');

const { transformTransaction } = require('../transformer/transactionTransformer');

const create = async (data) => {
  return TransactionBpjs.create(data);
};

const findAll = async (whereClause, options) => {
  const { limit, offset, sortBy, sortOrder } = options;
  
  const transactions = await  TransactionBpjs.findAll({
    include: [
      { 
        model: MasterDiagnosis, 
        as: 'diagnoses', 
        through: { attributes: ['is_primary'] } 
      },
    ],
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });
  
  if (!transactions || transactions.length === 0) {
    return [];
  }

  return transactions.map(transaction => transformTransaction(transaction));
};

const count = async (whereClause) => {
  return TransactionBpjs.count({ where: whereClause });
};

const findById = async (id) => {
  const transaction = await TransactionBpjs.findByPk(id, {
    include: [
      { 
        model: MasterDiagnosis, 
        as: 'diagnoses', 
        through: { attributes: ['is_primary'] } 
      },
      { 
        model: TransactionBpjsDocument, 
        as: 'document_checklist' 
      }
    ]
  });

  if (!transaction) {
    return null;
  }

  return transformTransaction(transaction);
};

module.exports = {
  create,
  findAll,
  count,
  findById,
};