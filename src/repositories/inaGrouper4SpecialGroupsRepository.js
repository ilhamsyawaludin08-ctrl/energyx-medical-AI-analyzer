const { Op } = require('sequelize');
const { 
    InaGrouper4SpecialGroups  
} = require('../models');

const { findTariffByInacbg } = require("./tariffRepository");
const { findSpecialTariffByInacbg } = require("./specialCmgTariffRepository");

const findInacbgByCodeDiagnosa = async (diagnosaCode) => {
    try {
        const results = [];

        for (const diagnosa of diagnosaCode) {
            const data = await InaGrouper4SpecialGroups.findAll({
                where: {
                    diagnosa_list: {
                        [Op.like]: `%${diagnosa}%`
                    }
                },
            });

            if (data && data.length > 0) {
                const inacbgCodes = data.map(item => ({
                    inacbg: item.inacbg,
                    cmg_description: item.cmg_description,
                    cmg_type: item.cmg_type
                }));

                const [inacbgTariffs, inacbgSpecialTariff] = await Promise.all([
                    Promise.all(inacbgCodes.map(code => findTariffByInacbg(code.inacbg))),
                    Promise.all(inacbgCodes.map(code => findSpecialTariffByInacbg(code.inacbg)))
                ]);

                const inacbgData = inacbgCodes.map((code, index) => {
                    const tariff = inacbgTariffs[index];
                    const specialTariff = inacbgSpecialTariff[index];

                    return {
                        inacbg: code.inacbg,
                        cmg_description: code.cmg_description,
                        cmg_type: code.cmg_type,
                        tariff: tariff?.tariff || 0,
                        specialTariff: specialTariff?.tariff || 0,
                        isSpecial: !!(specialTariff?.found)
                    };
                });

                results.push({
                    diagnosa: diagnosa,
                    inacbg_data: inacbgData,
                    found_count: data.length
                });
            } else {
                results.push({
                    diagnosa: diagnosa,
                    inacbg_data: [
                        {
                            inacbg: '-',
                            cmg_description: '-',
                            cmg_type: '-',
                            tariff: 200000,
                            found: false,
                        }
                    ],
                    found_count: 0
                });
            }
        }

        return results;

    } catch (error) {
        console.error('Error in findInacbgByCodeDiagnosa:', error);
        throw error;
    }
};


const findInacbgByTindakanDiagnosa = async (procedureCode) => {
    try {
        const results = [];
        
        for (const procedure of procedureCode) { 
            const data = await InaGrouper4SpecialGroups.findAll({
                where: {
                    procedure_list: {
                        [Op.like]: `%${procedure}%`
                    }
                },
            });
            
            if (data && data.length > 0) {
                const inacbgCodes = data.map(item => ({
                    inacbg: item.inacbg,
                    cmg_description: item.cmg_description,
                    cmg_type: item.cmg_type
                }));
                
                const [inacbgTariffs, inacbgSpecialTariff] = await Promise.all([
                    Promise.all(inacbgCodes.map(code => findTariffByInacbg(code.inacbg))),
                    Promise.all(inacbgCodes.map(code => findSpecialTariffByInacbg(code.inacbg)))
                ]);
                
                const inacbgData = inacbgCodes.map((code, index) => {
                    const tariff = inacbgTariffs[index];
                    const specialTariff = inacbgSpecialTariff[index];
                    
                    return {
                        inacbg: code.inacbg, 
                        cmg_description: code.cmg_description,
                        cmg_type: code.cmg_type,
                        tariff: tariff?.tariff || 0,
                        specialTariff: specialTariff?.tariff || 0,
                        isSpecial: !!(specialTariff?.found)
                    };
                });
                
                results.push({
                    procedure: procedure,
                    inacbg_data: inacbgData,
                    found_count: data.length
                });
            } else {
                results.push({
                    procedure: procedure,
                    inacbg_data: [
                        {
                            inacbg: '-',
                            cmg_description: '-',
                            cmg_type: '-',
                            tariff: 200000,
                            found: false,
                        }
                    ],
                    found_count: 0
                });
            }
        }
        
        return results;
        
    } catch (error) {
        console.error('Error in findInacbgByTindakanDiagnosa:', error);
        throw error;
    }
};

module.exports = {
    findInacbgByCodeDiagnosa,
    findInacbgByTindakanDiagnosa,
};
