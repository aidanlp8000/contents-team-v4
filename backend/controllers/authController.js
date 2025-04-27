// backend/controllers/authController.js
const passport = require('passport');

// Initiate Google OAuth login
exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Handle Google OAuth callback
exports.googleCallback = passport.authenticate('google', {
  failureRedirect: process.env.FRONTEND_URL + '/',
  session: true,
});

// After successful login, redirect to frontend dashboard
exports.handleCallbackRedirect = (req, res) => {
  res.redirect(process.env.FRONTEND_URL + '/dashboard');
};

// Log the user out
exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect(process.env.FRONTEND_URL + '/');
  });
};

// Return current authenticated user
exports.getCurrentUser = (req, res) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // You can choose which fields to send back
  const { id, email, name, photo_url, role, membership_status } = req.user;
  res.json({ id, email, name, photo_url, role, membership_status });
};
