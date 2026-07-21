const { Op } = require('sequelize');
const { Inacbg, AiDiagnosis, AiTreatment, InaGrouper4SpecialGroups, SpecialCmgTariff, Tariff } = require("../models")

const getInacbg = async (req) => {
  const search = req.query.search || ''
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  
  // sorting
  const sortBy = req.query.sortBy || 'inacbg'
  const sortDesc = req.query.sortDesc === 'true'
  const order = sortDesc ? 'DESC' : 'ASC'

  // custom filters
  const regional = req.query.regional || ''
  const kelas_rawat = req.query.kelas_rawat || ''

  const whereCondition = {}

  if (search) {
    whereCondition[Op.or] = [
      { inacbg: { [Op.like]: `%${search}%` } },
      { kode_tariff: { [Op.like]: `%${search}%` } }
    ]
  }

  if (regional) {
    whereCondition.regional = regional
  }

  if (kelas_rawat) {
    whereCondition.kelas_rawat = kelas_rawat
  }

  const { rows, count } = await Tariff.findAndCountAll({
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

const createInacbg = async (data) => {
    return await Tariff.create(data);
}

const updateInacbg = async (inacbgCode, query, data) => {
    const { regional, kode_tariff, kelas_rawat } = query;
    const record = await Tariff.findOne({ where: { inacbg: inacbgCode, regional, kode_tariff, kelas_rawat } });
    if (!record) {
        const error = new Error('Data INA-CBG (Tariff) tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    return await record.update(data);
}

const deleteInacbg = async (inacbgCode, query) => {
    const { regional, kode_tariff, kelas_rawat } = query;
    const record = await Tariff.findOne({ where: { inacbg: inacbgCode, regional, kode_tariff, kelas_rawat } });
    if (!record) {
        const error = new Error('Data INA-CBG (Tariff) tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    await record.destroy();
    return true;
}

module.exports = {
  getInacbg,
  createInacbg,
  updateInacbg,
  deleteInacbg
}
