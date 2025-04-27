// backend/controllers/projectController.js
const db = require('../config/db');

// Fetch all projects for a user
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;  // assuming req.user is populated by your auth middleware
    const [projects] = await db.query(
      'SELECT * FROM projects WHERE user_id = ?',
      [userId]
    );
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Could not fetch projects' });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss } = req.body;
    const [result] = await db.query(
      `INSERT INTO projects 
         (user_id, title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss]
    );
    const [newProject] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(newProject[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Could not create project' });
  }
};

// Update an existing project
exports.updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    const { title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss } = req.body;
    await db.query(
      `UPDATE projects SET 
         title = ?, 
         description = ?, 
         insured_name = ?, 
         insured_address = ?, 
         claim_number = ?, 
         date_of_loss = ?, 
         type_of_loss = ?
       WHERE id = ? AND user_id = ?`,
      [title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss, projectId, userId]
    );
    const [updated] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Could not update project' });
  }
};

// Delete a project and its items
exports.deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    await db.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Could not delete project' });
  }
};
