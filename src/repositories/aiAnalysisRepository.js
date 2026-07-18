const { Op } = require('sequelize');
const { AiAnalysis, AiDiagnosis, AiSeverity, AiTreatment } = require("../models")
const { ApiResponse } = require('../utils/apiResponse');
const handleError = require('../monitor/errorHandler');

// ====================
// V0 Repository
// ====================

const save = async (condition, result, options = {}) => {
    try {
        const transaction = options.transaction
        const cleaned = condition.replace(/\\n/g, '\n')

        const idMatch = cleaned.match(/ID Pasien:\s*(.+)/)
        const nameMatch = cleaned.match(/Nama:\s*(.+)/)
        const service = cleaned.match(/Jenis Pelayanan:\s*(.+)/)
        const creator = cleaned.match(/Creator:\s*(.+)/)

        const encounterNumber = cleaned.match(/Nomor Kunjungan:\s*(.+)/)
        const doctorCode = cleaned.match(/Kode Dokter:\s*(.+)/)
        const hospitalCode = cleaned.match(/Kode RS:\s*(.+)/)

        const subjective = cleaned.match(/Subjective:\s*(.+)/)
        const objective = cleaned.match(/Objective:\s*(.+)/)
        const assesment = cleaned.match(/Assesment:\s*(.+)/)
        const age = cleaned.match(/Usia:\s*(.+)/)
        const gender = cleaned.match(/Jenis Kelamin:\s*(.+)/)
        const weight = cleaned.match(/Berat Badan:\s*(.+)/)

        const idPasien = idMatch[1].trim();
        const nama = nameMatch[1].trim();
        const layanan = service[1].trim();
        const createdBy = creator[1].trim();

        return AiAnalysis.create({
            patient_id: idPasien,
            patient_name: nama,
            condition_raw: condition,
            response_raw: result,
            service_type: layanan,
            created_by: createdBy,
            encounter_number: encounterNumber ? encounterNumber[1].trim() : '',
            doctor_code: doctorCode ? doctorCode[1].trim() : '',
            hospital_code: hospitalCode ? hospitalCode[1].trim() : '',
            subjective: subjective ? subjective[1].trim() : '',
            objective: objective ? objective[1].trim() : '',
            assesment: assesment ? assesment[1].trim() : '',
            age: age ? age[1].trim() : 0,
            gender: gender ? gender[1].trim() : '',
            weight: weight ? weight[1].trim() : 0,
        }, { transaction });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
}

const saveAnalysis = async (analysis, body, options = {}) => {
    try {
        const transaction = options.transaction;

        return AiAnalysis.create({
            patient_id: analysis.patient_id,
            patient_name: analysis.patient_name,
            condition_raw: JSON.stringify(body),
            response_raw: '',
            service_type: analysis.service_type,
            created_by: analysis.creator,
            encounter_number: analysis.encounter_number,
            doctor_code: analysis.doctor_code,
            hospital_code: analysis.hospital_code,
            subjective: analysis.subjective,
            objective: analysis.objective,
            assesment: analysis.assesment,
            age: analysis.age,
            gender: analysis.gender,
            weight: analysis.weight,
        }, { transaction });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
}

const get = async (id) => {
    return AiAnalysis.findAll({
        attributes: ['id', 'patient_id', 'patient_name', 'service_type'],
        where: { id },
        include: [
            {
                model: AiDiagnosis,
                as: 'diagnosis',
                attributes: [
                    'id', 
                    'analysis_id', 
                    'is_primary', 
                    'code', 
                    'title', 
                    'is_ai_recommendation', 
                    'is_selected', 
                    'confidence', 
                    'reason',
                ],
            },
            {
                model: AiSeverity,
                as: 'severity',
                attributes: [
                    'id',
                    'analysis_id',
                    'level',
                    'justification',
                    'checklist'
                ],
            },
            {
                model: AiTreatment,
                as: 'treatment',
                attributes: [
                    'id',
                    'analysis_id',
                    'code',
                    'title',
                    'is_ai_recommendation', 
                    'is_selected', 
                    'category',
                    'confidence',
                    'reason',
                    'inacbg',
                    'cost',
                ],
            }
        ]
    })
}

const getByEncounter = async (encounterNumber) => {
    return AiAnalysis.findAll({
        attributes: [
            'id',
            'patient_id',
            'patient_name',
            'age',
            'gender',
            'weight',
            'subjective',
            'objective',
            'assesment',
            'encounter_number',
            'doctor_code',
            'hospital_code',
            'service_type',
            'created_by',
            'created_at',
        ],
        where: { 
            encounter_number: encounterNumber 
        },
        include: [
            {
                model: AiDiagnosis,
                as: 'diagnosis',
                attributes: [
                    'id', 
                    'analysis_id', 
                    'is_primary', 
                    'code', 
                    'title', 
                    'is_ai_recommendation', 
                    'is_selected', 
                    'confidence', 
                    'reason',
                ],
            },
            {
                model: AiSeverity,
                as: 'severity',
                attributes: [
                    'id',
                    'analysis_id',
                    'level',
                    'justification',
                    'checklist'
                ],
            },
            {
                model: AiTreatment,
                as: 'treatment',
                attributes: [
                    'id',
                    'analysis_id',
                    'code',
                    'title',
                    'is_ai_recommendation',
                    'is_selected', 
                    'category',
                    'confidence',
                    'reason',
                    'inacbg',
                    'cost',
                ],
            }
        ],
        order: [
            ['id', 'DESC']
        ],
        limit: 1,
    })
}

const getAll = async ({search,limit,offset}) => {
    const whereCondition = {};

    if (search && search !== "") {
        whereCondition[Op.or] = [
          { patient_name: { [Op.like]: `%${search}%` } },
          { patient_id: { [Op.like]: `%${search}%` } },
          { encounter_number: { [Op.like]: `%${search}%` } },
        ];
    }

    const criteria = {
        attributes: [
            'id',
            'patient_id',
            'patient_name',
            'age',
            'gender',
            'weight',
            'subjective',
            'objective',
            'assesment',
            'encounter_number',
            'doctor_code',
            'hospital_code',
            'service_type',
            'created_at',
        ],
        where: whereCondition,
        limit,
        offset,
        order: [
            ['id', 'DESC']
        ],
    }

    const { count, rows } = await AiAnalysis.findAndCountAll(criteria)

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(count / limit);

    return {
        rows,
        totalRecords: count,
        totalPages,
        currentPage,
        perPage: limit,
        offset
    };
}

// ====================
// V1 Repository
// ====================

const saveV1 = async (input, result, options = {}, doctor_code, hospital_code) => {
    try {
        const transaction = options.transaction

        return AiAnalysis.create({
            patient_id: input.patient_id,
            patient_name: input.patient_name,
            condition_raw: JSON.stringify(input),
            response_raw: JSON.stringify(result),
            service_type: input.service_type,
            created_by: input.creator,
            encounter_number: input.encounter_number,
            doctor_code: doctor_code,
            hospital_code: hospital_code,
            subjective: input.subjective,
            objective: input.objective,
            assesment: input.assesment,
            age: input.age,
            gender: input.gender,
            weight: input.weight,
        }, { transaction });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
}

module.exports = {
    save,
    saveAnalysis,
    get,
    getAll,
    getByEncounter,
    saveV1
}