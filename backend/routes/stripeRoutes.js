// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const bodyParser = require('body-parser');

// Create a Checkout Session for subscriptions
router.post(
  '/create-checkout-session',
  ensureAuthenticated,
  stripeController.createCheckoutSession
);

// Stripe Webhook endpoint (use raw body for signature verification)
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

module.exports = router;
