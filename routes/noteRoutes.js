const express = require('express');
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.get('/', noteController.listNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
