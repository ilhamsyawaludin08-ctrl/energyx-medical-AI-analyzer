const { 
    Tariff,
    RsSetup  
} = require('../models');

const findTariffAllByInacbg = async (inacbgArray) => {
    try {
        // Cari data rumah sakit berdasarkan rs_no
        const rs = await RsSetup.findOne({ 
            where: { 
                rs_no: 3374076
            } 
        });

        // Jika rumah sakit tidak ditemukan
        if (!rs) {
            throw new Error('Rumah sakit tidak ditemukan');
        }

        // Buat array untuk menyimpan hasil tarif
        const tariffResults = [];

        // Loop untuk setiap inacbg
        for (const inacbg of inacbgArray) {
            const tariffData = await Tariff.findOne({
                where: {
                    inacbg: inacbg,
                    regional: rs.regional,
                    kode_tariff: rs.rs_tariff,
                }
            });

            tariffResults.push({
                inacbg: inacbg,
                tariff: tariffData ? tariffData.tariff : 0,
                found: !!tariffData,
                regional: rs.regional,
                kode_tariff: rs.rs_tariff
            });
        }
        
        return tariffResults;
        
    } catch (error) {
        console.error('Error in findTariffAllByInacbg:', error);
        throw error;
    }
};

const findTariffByInacbg = async (inacbg) => {
    try {
        // Cari data rumah sakit berdasarkan rs_no
        const rs = await RsSetup.findOne({ 
            where: { 
                rs_no: 3374076
            } 
        });

        // Jika rumah sakit tidak ditemukan
        if (!rs) {
            throw new Error('Rumah sakit tidak ditemukan');
        }

        const tariffData = await Tariff.findOne({
            where: {
                inacbg: inacbg,
                regional: rs.regional,
                kode_tariff: rs.rs_tariff,
            }
        });

        return {
            inacbg: inacbg,
            tariff: tariffData ? tariffData.tariff : 0,
            found: !!tariffData,
            regional: rs.regional,
            kode_tariff: rs.rs_tariff
        };
        
    } catch (error) {
        console.error('Error in findTariffByInacbg:', error);
        throw error;
    }
};

module.exports = {
    findTariffAllByInacbg,
    findTariffByInacbg,
};