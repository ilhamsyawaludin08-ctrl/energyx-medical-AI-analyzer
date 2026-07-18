'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Function to generate random claim amount above 5 million
    const generateRandomClaim = () => {
      // Random between 5,000,000 and 50,000,000
      return Math.floor(5000000 + Math.random() * 45000000);
    };
    
    // Diagnosis data dari spreadsheet
    const diagnosisData = [
      {
        disease_name: 'Fraktur gigi',
        icd10_code: 'S02.5',
        doctor_diagnosis: 'Fracture of tooth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Gigi patah',
        icd10_code: 'S02.5',
        doctor_diagnosis: 'Fracture of tooth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Gigi retak',
        icd10_code: 'S02.5',
        doctor_diagnosis: 'Fracture of tooth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'HIV',
        icd10_code: 'B20.9',
        doctor_diagnosis: 'HIV disease resulting in unspecified infectious or parasitic disease',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Erupsi sebagian',
        icd10_code: 'K00.6',
        doctor_diagnosis: 'Disturbances in tooth eruption',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Gangguan erupsi gigi',
        icd10_code: 'K00.6',
        doctor_diagnosis: 'Disturbances in tooth eruption',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Nekrosis pulpa',
        icd10_code: 'K04.1',
        doctor_diagnosis: 'Necrosis of pulp',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Pulpa mati',
        icd10_code: 'K04.1',
        doctor_diagnosis: 'Necrosis of pulp',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Kematian saraf gigi',
        icd10_code: 'K04.1',
        doctor_diagnosis: 'Necrosis of pulp',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Erosi',
        icd10_code: 'K03.2',
        doctor_diagnosis: 'Erosion of teeth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Pengikisan gigi',
        icd10_code: 'K03.2',
        doctor_diagnosis: 'Erosion of teeth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Abrasi',
        icd10_code: 'K03.1',
        doctor_diagnosis: 'Abrasion of teeth',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Demam Menggigil',
        icd10_code: 'R50.0',
        doctor_diagnosis: 'Fever with chills',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Demam berkepanjangan',
        icd10_code: 'R50.1',
        doctor_diagnosis: 'Persistent fever',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Demam menetap',
        icd10_code: 'R50.1',
        doctor_diagnosis: 'Persistent fever',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Demam dengue biasa',
        icd10_code: 'A90',
        doctor_diagnosis: 'Dengue fever [classical dengue]',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Demam berdarah dengue',
        icd10_code: 'A91',
        doctor_diagnosis: 'Dengue haemorrhagic fever',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'DBD',
        icd10_code: 'A91',
        doctor_diagnosis: 'Dengue haemorrhagic fever',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk',
        icd10_code: 'R05',
        doctor_diagnosis: 'Cough',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk Pilek',
        icd10_code: 'J00',
        doctor_diagnosis: 'Acute nasopharyngitis [common cold]',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk Flu',
        icd10_code: 'J00',
        doctor_diagnosis: 'Acute nasopharyngitis [common cold]',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk kering',
        icd10_code: 'R05',
        doctor_diagnosis: 'Cough',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk Berdahak',
        icd10_code: 'R05',
        doctor_diagnosis: 'Cough',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Batuk darah',
        icd10_code: 'R04.2',
        doctor_diagnosis: 'Haemoptysis',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Pusing',
        icd10_code: 'R42',
        doctor_diagnosis: 'Dizziness and giddiness',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Pusing Berat',
        icd10_code: 'R42',
        doctor_diagnosis: 'Dizziness and giddiness',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Pusing Ringan',
        icd10_code: 'R42',
        doctor_diagnosis: 'Dizziness and giddiness',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Gastritis',
        icd10_code: 'K29.5',
        doctor_diagnosis: 'Chronic gastritis, unspecified',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        disease_name: 'Maag',
        icd10_code: 'K29.5',
        doctor_diagnosis: 'Chronic gastritis, unspecified',
        claim: generateRandomClaim(),
        created_at: now,
        updated_at: now,
        deleted_at: null
      }
    ];

    // Insert semua data diagnosa ke dalam tabel
    return queryInterface.bulkInsert('diagnosis_master', diagnosisData, {});
  },

  async down(queryInterface, Sequelize) {
    // Hapus semua record jika rollback
    await queryInterface.bulkDelete('diagnosis_master', null, {});
  }
};