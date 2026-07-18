const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransactionBpjsDocument = sequelize.define('TransactionBpjsDocument', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  transaction_bpjs_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'bpjs_transactions',
      key: 'id'
    }
  },
  has_medical_resume: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Resume Medis lengkap (ICD + tindakan + kronologi)'
  },
  has_lab_results: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Pemeriksaan Lab (HbA1c, GDS, Kreatinin, Urin)'
  },
  has_imaging: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Imaging / echocardiografi'
  },
  has_specialist_consultation: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Konsultasi dokter spesialis'
  },
  has_iv_therapy_proof: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Bukti pemberian terapi IV (antibiotik, insulin, dll)'
  },
  has_daily_care_notes: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Catatan harian perawatan'
  },
  has_min_5day_inpatient: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Surat rawat inap minimal 5 hari'
  },
  severity_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Level keparahan kasus'
  }
}, {
  tableName: 'transaction_bpjs_documents',
  timestamps: true,
});

module.exports = TransactionBpjsDocument;