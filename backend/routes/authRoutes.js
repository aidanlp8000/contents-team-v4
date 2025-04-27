// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Start Google OAuth flow
router.get(
  '/google',
  authController.googleLogin
);

// Google OAuth callback URL
router.get(
  '/google/callback',
  authController.googleCallback,
  authController.handleCallbackRedirect
);

// Logout route
router.get(
  '/logout',
  authController.logout
);

// Get currently authenticated user
router.get(
  '/user',
  authController.getCurrentUser
);

module.exports = router;
