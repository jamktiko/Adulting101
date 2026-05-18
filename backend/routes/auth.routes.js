// routes/auth.routes.js
//
// Reititys: /api/signup, /api/login, /api/confirm
// Täällä pidetään vain URL-polut + validointi + ohjaus controllerille.

const express = require('express');
const router = express.Router();

const {
  validateSignup,
  validateLogin,
  validateConfirm,
  handleValidationErrors,
} = require('../middleware/validators');

const authController = require('../controllers/auth.controller');

router.post(
  '/signup',
  validateSignup,
  handleValidationErrors,
  authController.signup,
);
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  authController.login,
);
router.post(
  '/confirm',
  validateConfirm,
  handleValidationErrors,
  authController.confirm,
);

module.exports = router;
