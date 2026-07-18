const { Op } = require('sequelize');
const { MasterDiagnosis } = require("../models")

const findAllByDiagnosis = async (diagnosis) => {
    return MasterDiagnosis.findAll({
        limit: 10,   
        attributes: ['id', 'disease_name', 'icd10_code','doctor_diagnosis', 'claim'],
        where: {
            [Op.or]: [
                {
                    doctor_diagnosis: {
                        [Op.like]: `%${diagnosis}%`
                    }
                },
                {
                    disease_name: {
                        [Op.like]: `%${diagnosis}%` 
                    }
                },
                {
                    icd10_code: {
                        [Op.like]: `%${diagnosis}%` 
                    }       
                }
            ]
        }
    });
}

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

module.exports = {
    findAllByDiagnosis,
    findAll,
    findById
}