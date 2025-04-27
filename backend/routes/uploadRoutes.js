// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Get all projects for the current user
router.get(
  '/',
  ensureAuthenticated,
  projectController.getProjects
);

// Create a new project
router.post(
  '/',
  ensureAuthenticated,
  projectController.createProject
);

// Update an existing project
router.put(
  '/:projectId',
  ensureAuthenticated,
  projectController.updateProject
);

// Delete a project (and its items)
router.delete(
  '/:projectId',
  ensureAuthenticated,
  projectController.deleteProject
);

module.exports = router;
