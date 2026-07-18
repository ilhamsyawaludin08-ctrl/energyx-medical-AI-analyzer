const { SpecialCmgTariff, RsSetup } = require("../models"); 

const findSpecialTariffByInacbg = async (inacbg) => {
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

        const tariffData = await SpecialCmgTariff.findOne({
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
        console.error('Error in findSpecialTariffByInacbg:', error);
        throw error;
    }
};

module.exports = {
    findSpecialTariffByInacbg
};