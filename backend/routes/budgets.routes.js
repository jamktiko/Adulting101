// routes/budgets.routes.js
//
// Reititys: /api/budgets/*

const express = require('express');
const router = express.Router();

const {
  validateBudgetEntry,
  validateRecurringEntry,
  validateBudgetLimit,
  handleValidationErrors,
} = require('../middleware/validators');

const budgetsController = require('../controllers/budgets.controller');

router.get('/recurring/:userId', budgetsController.getRecurring);
router.get('/:userId/:month', budgetsController.getBudget);

router.patch(
  '/:userId/:month/limit',
  validateBudgetLimit,
  handleValidationErrors,
  budgetsController.setLimit,
);

router.post(
  '/recurring/:userId',
  validateRecurringEntry,
  handleValidationErrors,
  budgetsController.addRecurring,
);

router.post(
  '/:userId/:month/entry',
  validateBudgetEntry,
  handleValidationErrors,
  budgetsController.addEntry,
);

router.delete('/recurring/:entryId', budgetsController.deleteRecurring);
router.delete('/:userId/:month/entry/:entryId', budgetsController.deleteEntry);

module.exports = router;
