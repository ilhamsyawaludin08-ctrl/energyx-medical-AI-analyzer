const express = require('express');
const router = express.Router();

const diagnosisController = require('../controllers/diagnosisController');
const transactionController = require('../controllers/transactionController');
const recomendationController = require('../controllers/recomendationController')
const analysisController = require('../controllers/analysisController')
const mrconsoController = require('../controllers/mrconsoController')
const clientController = require('../controllers/clientController')

const userController = require('../controllers/userController')
const handleError = require('../monitor/errorHandler');

const { recommendationSchema } = require('../validations/recomendationValidation');

const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { authenticateJWT, authorizeRoles } = require('../middlewares/jwtAuth')

const {
  createTransactionSchema
} = require('../validations/transactionValidation');

// Router Test Error
router.get('/error', (req, res) => {
  throw new Error('This is a test error');
});

// ====================
// V0 ROUTES GROUPED
// ====================

// Recomedation
router.post('/recomendation', diagnosisController.recomendation);
router.get('/recommendation/:id', recomendationController.getRecommendation)
router.post('/recommendation/log', recomendationController.saveRecommendation)

// Diagnosis
router.get('/diagnosis', authenticateJWT, diagnosisController.getAllDiagnosis);

// Transaction BPJS
router.post('/transactions', validate(createTransactionSchema), transactionController.createTransaction);
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);


// ====================
// V1 ROUTES GROUPED
// ====================
const v1Router = express.Router();

// recomendation
v1Router.post('/recomendation', authMiddleware, validate(recommendationSchema) , diagnosisController.recomendationV1);

// service
v1Router.get('/service/encounters', authenticateJWT, analysisController.getAllEncounter)
v1Router.get('/service/encounters/:encounterNumber', authenticateJWT, analysisController.getByEncounter)

// mrconso
v1Router.get('/mrconso', authenticateJWT, mrconsoController.getMrconso)

// mrconso
v1Router.get('/mrconso_indo', mrconsoController.getMrconsoIndo)

// client
v1Router.post('/client/register', clientController.save)
//user
v1Router.post('/user/register', authenticateJWT, userController.save)
v1Router.post('/user/login', userController.login)
v1Router.patch('/user/update-password', authenticateJWT, userController.updatePassword)

v1Router.get('/update/mrconso', diagnosisController.updateMrconso)

router.use('/v1', v1Router);

router.use((err, req, res, next) => {
  handleError('error', {
    type: err.name,
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({
    status: 500,
    error: {
      type: err.name,
      message: err.message
    }
  });
});

module.exports = router;
