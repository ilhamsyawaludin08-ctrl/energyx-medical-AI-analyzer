const { Op } = require('sequelize');
const { Mrconso } = require("../models")

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
    order: [['code', 'ASC']]
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



module.exports = {
  getTreatment,
  getDiagnosis,
  getMrconso,
  getMrconsoStr,
  updateStrMRConso,
  getMrconsoStrIndo,
  getMrconsoIndo
}