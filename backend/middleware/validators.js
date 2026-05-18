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
  body('frequency').isIn(['kuukausittain', 'viikoittain']),
];

const validateBudgetLimit = body('monthlyBudgetLimit').isFloat({
  min: 0,
  max: 1000000,
});

const validateSignup = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Käyttäjätunnus tulee olla 3-50 merkkiä pitkä')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Käyttäjätunnus voi sisältää vain kirjaimia, numeroita, viivoja ja alaviivoja',
    )
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Sähköposti ei ole validi')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Salasana tulee olla vähintään 8 merkkiä pitkä')
    .matches(/[A-Z]/)
    .withMessage('Salasanassa tulee olla vähintään yksi iso kirjain')
    .matches(/[a-z]/)
    .withMessage('Salasanassa tulee olla vähintään yksi pieni kirjain')
    .matches(/[0-9]/)
    .withMessage('Salasanassa tulee olla vähintään yksi numero'),
];

const validateLogin = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Käyttäjätunnus vaaditaan')
    .trim(),
  body('password').isLength({ min: 1 }).withMessage('Salasana vaaditaan'),
];

const validateConfirm = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Käyttäjätunnus vaaditaan')
    .trim(),
  body('code')
    .isLength({ min: 1, max: 10 })
    .withMessage('Vahvistuskoodi vaaditaan')
    .trim(),
];

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
  validateSignup,
  validateLogin,
  validateConfirm,
  handleValidationErrors,
};
