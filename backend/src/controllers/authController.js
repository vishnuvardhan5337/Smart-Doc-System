const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const ApiError = require('../utils/apiError')
const asyncHandler = require('../utils/asyncHandler')

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400)
  }

  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError('Email already registered', 400)
  }

  // password gets hashed in the pre-save hook on the User model
  const user = await User.create({ name, email, password })
  const token = generateToken(user._id)

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  })
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400)
  }

  const { email, password } = req.body

  // need +password because select: false in schema
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid email or password', 401)
  }

  const token = generateToken(user._id)

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  })
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email }
  })
})

module.exports = { signup, login, getMe }
