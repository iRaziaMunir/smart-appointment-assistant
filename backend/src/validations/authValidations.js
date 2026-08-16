const { body } = require('express-validator');

const registerValidationRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
];

const loginValidationRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
};
