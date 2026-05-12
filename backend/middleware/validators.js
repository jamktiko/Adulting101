const { body, validationResult } = require('express-validator');

const validateBudgetEntry = [
  body('type').isIn(['income', 'expense']).trim(),
  body('category').isLength({ min: 1, max: 50 }).trim().escape(),
  body('amount').isFloat({ min: 0.01, max: 999999.99 }),
  body('description').isLength({ max: 250 }).trim().escape(),
  body('date').isISO8601().toDate(),
];

const validateRecurringEntry = [
  body('type').isIn(['income', 'expense']),
  body('category').isLength({ min: 1, max: 50 }).trim().escape(),
  body('amount').isFloat({ min: 0.01, max: 999999.99 }),
  body('description').isLength({ max: 250 }).trim().escape(),
  body('frequency').isIn(['monthly', 'weekly']),
];

const validateBudgetLimit = body('monthlyBudgetLimit').isFloat({
  min: 0,
  max: 1000000,
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validointivirhe',
      details: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateBudgetEntry,
  validateRecurringEntry,
  validateBudgetLimit,
  handleValidationErrors,
};
