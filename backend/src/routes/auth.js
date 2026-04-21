const express = require('express')
const { body } = require('express-validator')
const { signup, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Validation rules using express-validator
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
]

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]

router.post('/signup', signupValidation, signup)
router.post('/login', loginValidation, login)
router.get('/me', protect, getMe)

module.exports = router
