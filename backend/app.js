// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db = require('./config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const exportRoutes = require('./routes/exportRoutes');
const projectItemsRoutes = require('./routes/projectItemsRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Passport Google OAuth2 setup ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
        ['google', profile.id]
      );
      if (rows.length > 0) {
        return done(null, rows[0]);
      }
      const [result] = await db.query(
        `INSERT INTO users 
         (oauth_provider, oauth_id, email, name, photo_url, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['google', profile.id, profile.emails[0].value, profile.displayName, profile.photos[0].value, 'user']
      );
      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      done(null, newUser[0]);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err, null);
  }
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/project-items', projectItemsRoutes);
app.use('/api/stripe', stripeRoutes);

// --- Health check or root ---
app.get('/', (req, res) => {
  res.send('Contents.Team backend is running.');
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
