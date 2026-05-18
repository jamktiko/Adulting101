// routes/users.routes.js
//
// Reititys: /api/users/*

const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');

router.get('/', usersController.getAll);

// Muuttolista
router.get('/:userId/move-checklist', usersController.getMoveChecklist);
router.patch('/:userId/toggle-move-item', usersController.toggleMoveItem);

// Viikkosiivous
router.get('/:userId/cleaning-checklist', usersController.getCleaningChecklist);
router.patch(
  '/:userId/toggle-cleaning-task',
  usersController.toggleCleaningTask,
);

// Muistilaput
router.get('/:userId/notes', usersController.getNotes);
router.post('/:userId/notes', usersController.addNote);
router.delete('/:userId/notes/:noteId', usersController.deleteNote);

module.exports = router;
