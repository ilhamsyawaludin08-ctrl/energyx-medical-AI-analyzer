const { Op } = require('sequelize');
const { Mrconso, MasterDiagnosis } = require("../models")

const findAllByDiagnosis = async (diagnosis) => {
    // 1. Prioritize EXACT match on CODE first
    const exactMatches = await MasterDiagnosis.findAll({
        limit: 10,
        where: { 
            icd10_code: diagnosis
        }
    });

    const remainingLimit = 10 - exactMatches.length;
    let wildcardMatches = [];

    // 2. Fill the rest with wildcard matches
    if (remainingLimit > 0) {
        const exactCodes = exactMatches.map(e => e.icd10_code);
        
        wildcardMatches = await MasterDiagnosis.findAll({
            limit: remainingLimit,
            where: {
                ...(exactCodes.length > 0 && { icd10_code: { [Op.notIn]: exactCodes } }),
                [Op.or]: [
                    { icd10_code: { [Op.like]: `%${diagnosis}%` } },
                    { disease_name: { [Op.like]: `%${diagnosis}%` } },
                    { doctor_diagnosis: { [Op.like]: `%${diagnosis}%` } }
                ]
            }
        });
    }

    const allMatches = [...exactMatches, ...wildcardMatches];
    
    // Map structure to what frontend expects for Autocomplete
    return allMatches.map(m => ({
        id: m.icd10_code,
        icd10_code: m.icd10_code,
        disease_name: m.disease_name,
        doctor_diagnosis: m.doctor_diagnosis,
        claim: m.claim
    }));
};

const findAll = async () => {
    return MasterDiagnosis.findAll(
        {
            attributes: ['id', 'disease_name', 'icd10_code','doctor_diagnosis']
        }
    );
}

const findById = async (id) => {
    return MasterDiagnosis.findByPk(id);
};

const findOrCreateByCode = async (icd10Code) => {
    // Check if it already exists in MasterDiagnosis
    let masterData = await MasterDiagnosis.findOne({ where: { icd10_code: icd10Code } });
    if (masterData) return masterData;

    // If not, fetch from mrconso and insert
    const mrconsoData = await Mrconso.findOne({ where: { code: icd10Code } });
    if (!mrconsoData) return null;

    masterData = await MasterDiagnosis.create({
        icd10_code: mrconsoData.code,
        disease_name: mrconsoData.str_indo || mrconsoData.str,
        doctor_diagnosis: mrconsoData.str,
        claim: 0
    });
    return masterData;
};

module.exports = {
    findAllByDiagnosis,
    findAll,
    findById,
    findOrCreateByCode
}