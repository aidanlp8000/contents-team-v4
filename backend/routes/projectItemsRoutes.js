// backend/routes/projectItemsRoutes.js
const express = require('express');
const router = express.Router();
const projectItemsController = require('../controllers/projectItemsController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Get all items for a project
router.get(
  '/:projectId',
  ensureAuthenticated,
  projectItemsController.getItems
);

// Update a specific item (e.g., after edit or “Check Price”)
router.put(
  '/:itemId',
  ensureAuthenticated,
  projectItemsController.updateItem
);

// Delete a specific item
router.delete(
  '/:itemId',
  ensureAuthenticated,
  projectItemsController.deleteItem
);

// Trigger a SerpAPI “Check Price” and metadata update
router.post(
  '/:itemId/check-price',
  ensureAuthenticated,
  projectItemsController.checkPrice
);

module.exports = router;
