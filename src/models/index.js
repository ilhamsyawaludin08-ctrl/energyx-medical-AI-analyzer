const MasterDiagnosis = require('./masterDiagnosis');
const TransactionBpjs = require('./transactionBPJS');
const TransactionBpjsHasDiagnosis = require('./transactionBPJSHasDiagnosis');
const TransactionBpjsDocument = require('./transactionPBJSDocument');
const RsSetup = require('./rsSetup');
const Tariff = require('./tariff');
const AiAnalysis = require('./aiAnalysis')
const AiDiagnosis = require('./aiDiagnosis')
const AiSeverity = require('./aiSeverity')
const AiTreatment = require('./aiTreatment')
const Mrconso = require('./mrconso')
const Inacbg = require('./inacbg')
const InaGrouper4SpecialGroups = require('./inaGrouper4SpecialGroups')
const SpecialCmgTariff = require('./specialCmgTariff')
const Client = require('./client')
const Department = require('./department')
const User = require('./user')

TransactionBpjs.belongsToMany(MasterDiagnosis, {
    through: TransactionBpjsHasDiagnosis,
    foreignKey: 'transaction_bpjs_id',
    otherKey: 'diagnosis_master_id',
    as: 'diagnoses'
});

MasterDiagnosis.belongsToMany(TransactionBpjs, {
    through: TransactionBpjsHasDiagnosis,
    foreignKey: 'diagnosis_master_id',
    otherKey: 'transaction_bpjs_id',
    as: 'transactions'
});

TransactionBpjs.hasOne(TransactionBpjsDocument, {
    foreignKey: 'transaction_bpjs_id',
    as: 'document_checklist'
});

TransactionBpjsDocument.belongsTo(TransactionBpjs, {
    foreignKey: 'transaction_bpjs_id',
    as: 'transaction'
});

AiDiagnosis.belongsTo(AiAnalysis, {
    foreignKey: 'analysis_id',
    as: 'analysis'
});

AiSeverity.belongsTo(AiAnalysis, {
    foreignKey: 'analysis_id',
    as: 'analysis'
});

AiTreatment.belongsTo(AiAnalysis, {
    foreignKey: 'analysis_id',
    as: 'analysis'
});

AiAnalysis.hasMany(AiDiagnosis, {
    foreignKey: 'analysis_id', 
    as: 'diagnosis'
});

AiAnalysis.hasMany(AiSeverity, {
    foreignKey: 'analysis_id',
    as: 'severity'
});

AiAnalysis.hasMany(AiTreatment, {
    foreignKey: 'analysis_id',
    as: 'treatment'
});

User.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department',
});

Department.hasMany(User, {
    foreignKey: 'department_id', 
    as: 'department',
});

User.belongsTo(Client, {
    foreignKey: 'rs_id',
    as: 'hospital',
});

Client.hasMany(User, {
    foreignKey: 'rs_id', 
    as: 'hospital',
})
  
module.exports = { 
    MasterDiagnosis,
    TransactionBpjs,
    TransactionBpjsHasDiagnosis,
    TransactionBpjsDocument,
    RsSetup,
    Tariff,
    AiAnalysis,
    AiDiagnosis,
    AiSeverity,
    AiTreatment,
    Mrconso,
    Inacbg,
    InaGrouper4SpecialGroups,
    SpecialCmgTariff,
    Client,
    Department,
    User,
};
