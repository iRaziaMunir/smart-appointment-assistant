const { body } = require('express-validator');

const chatMessageValidationRules = [
  body('message').trim().notEmpty().isLength({ max: 2000 }),
];

module.exports = {
  chatMessageValidationRules,
};
