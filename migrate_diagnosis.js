const { Mrconso, MasterDiagnosis } = require('./src/models');
const { Op } = require('sequelize');

function getRandomPrice(min, max) {
    // Generate a number in multiples of 50,000 for realistic look
    const step = 50000;
    const steps = Math.floor((max - min) / step);
    const randomStep = Math.floor(Math.random() * (steps + 1));
    return min + (randomStep * step);
}

function calculateClaim(code) {
    if (!code) return getRandomPrice(500000, 2500000);
    const prefix = code.charAt(0).toUpperCase();
    
    switch (prefix) {
        case 'A':
        case 'B': // Infectious
            return getRandomPrice(1500000, 5000000);
        case 'C': // Neoplasms
            return getRandomPrice(10000000, 50000000);
        case 'I': // Circulatory
            return getRandomPrice(5000000, 40000000);
        case 'J': // Respiratory
            return getRandomPrice(200000, 3000000);
        case 'O': // Pregnancy
            return getRandomPrice(3000000, 15000000);
        default:
            return getRandomPrice(500000, 2500000);
    }
}

async function migrate() {
    try {
        console.log('Starting migration...');
        // Clear existing data in MasterDiagnosis if needed to avoid duplicates or messy data
        await MasterDiagnosis.destroy({ where: {}, truncate: true });
        console.log('Cleared existing diagnosis_master data.');

        // Get all ICD10 from mrconso
        const records = await Mrconso.findAll({
            where: {
                sab: { [Op.like]: '%ICD10%' }
            },
            attributes: ['code', 'str', 'str_indo']
        });
        
        console.log(`Found ${records.length} records in mrconso. Processing...`);

        // We can do bulk create in chunks
        const chunkSize = 1000;
        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize).map(record => {
                return {
                    disease_name: record.str_indo || record.str || record.code, // Fallbacks
                    icd10_code: record.code,
                    doctor_diagnosis: record.str, // English string as doctor diagnosis
                    claim: calculateClaim(record.code)
                };
            });

            await MasterDiagnosis.bulkCreate(chunk);
            console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
