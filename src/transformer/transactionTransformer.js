const transformTransaction = (transaction) => {
    if (!transaction) return null;

    const plainTransaction = transaction.get ? transaction.get({ plain: true }) : transaction;

    let primaryDiagnosis = null;
    let secondaryDiagnoses = [];
  
    if (plainTransaction.diagnoses && plainTransaction.diagnoses.length > 0) {
      for (const diagnosis of plainTransaction.diagnoses) {
        const junction = diagnosis.TransactionBpjsHasDiagnosis;
        
        const formattedDiagnosis = {
          id: diagnosis.id,
          disease_name: diagnosis.disease_name,
          icd10_code: diagnosis.icd10_code,
          doctor_diagnosis: diagnosis.doctor_diagnosis
        };
        
        if (junction && junction.is_primary) {
          primaryDiagnosis = formattedDiagnosis;
        } else {
          secondaryDiagnoses.push(formattedDiagnosis);
        }
      }
    }
  
    delete plainTransaction.diagnoses;
    
    return {
      ...plainTransaction,
      primary_diagnosis: primaryDiagnosis,
      secondary_diagnosis: secondaryDiagnoses
    };
};

module.exports = {
    transformTransaction
};
  