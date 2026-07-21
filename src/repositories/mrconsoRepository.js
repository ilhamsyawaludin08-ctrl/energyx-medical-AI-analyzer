const { Op } = require('sequelize');
const { Mrconso, MasterDiagnosis, AiDiagnosis, AiTreatment } = require("../models")

const getTreatment = async (req) => {
  const page = parseInt(req.query.pageTreatment) || 1;
  const limit = parseInt(req.query.limitTreatment) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.searchTreatment || '';

  const whereCondition = {
    sab: { [Op.like]: '%ICD9%' },
  };

  if (search) {
    whereCondition[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { str: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows, count } = await Mrconso.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['code', 'ASC']]
  });

  return {
    data: rows,
    total: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
}

const getDiagnosis = async (req) => {
  const page = parseInt(req.query.pageDiagnosis) || 1;
  const limit = parseInt(req.query.limitDiagnosis) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.searchDiagnosis || '';

  const whereCondition = {
    sab: { [Op.like]: '%ICD10%' },
  };

  if (search) {
    whereCondition[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { str: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows, count } = await Mrconso.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['code', 'ASC']]
  });

  return {
    data: rows,
    total: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };

}

const getMrconso = async (req) => {
  const type = req.query.type || ''
  const search = req.query.search || ''
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const sortBy = req.query.sortBy || 'code'
  const sortDesc = req.query.sortDesc === 'true'
  const order = sortDesc ? 'DESC' : 'ASC'

  const whereCondition = {}

  if (type == 'Diagnosis') {
    whereCondition[Op.or] = {
      sab: { [Op.like]: '%ICD10%' },
    }
  } else if (type == 'Tindakan') {
    whereCondition[Op.or] = {
      sab: { [Op.like]: '%ICD9%' },
    }
  }

  if (search) {
    whereCondition[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { str: { [Op.like]: `%${search}%` } }
    ]
  }

  const { rows, count } = await Mrconso.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [[sortBy, order]]
  })

  return {
    data: rows,
    total: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  }
}

const getMrconsoIndo = async (req) => {
  const type = req.query.type || ''
  const search = req.query.search || ''
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const whereCondition = {}

  if (type == 'Diagnosis') {
    whereCondition[Op.or] = {
      sab: { [Op.like]: '%ICD10%' },
    }
  } else if (type == 'Tindakan') {
    whereCondition[Op.or] = {
      sab: { [Op.like]: '%ICD9%' },
    }
  }

  if (search) {
    whereCondition[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { str_indo: { [Op.like]: `%${search}%` } }
    ]
  }

  const { rows, count } = await Mrconso.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['code', 'ASC']]
  })

  return {
    data: rows,
    total: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  }
}

const getMrconsoStr = async () => {
  return await Mrconso.findAll({
    where: {
      str_indo: null,
    },
    limit: 100,
  });
};

const getMrconsoStrIndo = async () => {
  return await Mrconso.findAll({
    where: {
      str_indo: {
        [Op.not]: null
      }
    },
    limit: 100,
  });
};

const updateStrMRConso = async (strList) => {
  await Promise.all(
    strList.map(item =>
      Mrconso.update(
        { str_indo: item.str_indo_list },
        { where: { str: item.str } }
      )
    )
  );
};

const createMrconso = async (data) => {
    return await Mrconso.create(data);
}

const updateMrconso = async (code, data) => {
    const record = await Mrconso.findByPk(code);
    if (!record) {
        const error = new Error('Data ICD tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    return await record.update(data);
}

const deleteMrconso = async (code) => {
    const record = await Mrconso.findByPk(code);
    if (!record) {
        const error = new Error('Data ICD tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // Safety checks
    const isUsedInMasterDiagnosis = await MasterDiagnosis.findOne({ where: { icd10_code: code } });
    if (isUsedInMasterDiagnosis) {
        const error = new Error('Data tidak dapat dihapus karena masih digunakan di MasterDiagnosis');
        error.statusCode = 400;
        throw error;
    }

    const isUsedInAiDiagnosis = await AiDiagnosis.findOne({ where: { code: code } });
    if (isUsedInAiDiagnosis) {
        const error = new Error('Data tidak dapat dihapus karena masih digunakan di AiDiagnosis');
        error.statusCode = 400;
        throw error;
    }

    const isUsedInAiTreatment = await AiTreatment.findOne({ where: { code: code } });
    if (isUsedInAiTreatment) {
        const error = new Error('Data tidak dapat dihapus karena masih digunakan di AiTreatment');
        error.statusCode = 400;
        throw error;
    }

    await record.destroy();
    return true;
}

module.exports = {
  getTreatment,
  getDiagnosis,
  getMrconso,
  getMrconsoStr,
  updateStrMRConso,
  getMrconsoStrIndo,
  getMrconsoIndo,
  createMrconso,
  updateMrconso,
  deleteMrconso
}