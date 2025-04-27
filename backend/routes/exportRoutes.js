// backend/routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Export project contents to Excel
router.get(
  '/excel/:projectId',
  ensureAuthenticated,
  exportController.exportExcel
);

// Export project contents to PDF
router.get(
  '/pdf/:projectId',
  ensureAuthenticated,
  exportController.exportPdf
);

module.exports = router;
