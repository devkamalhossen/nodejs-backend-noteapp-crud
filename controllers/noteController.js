const mongoose = require('mongoose');
const Note = require('../models/Note');

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return null;
  }
  return { page, limit };
}

exports.listNotes = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    return res.status(400).json({ message: 'Page must be positive and limit must be between 1 and 100.' });
  }

  // Admin can view all notes; User can view only their own notes
  const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit),
    Note.countDocuments(filter),
  ]);

  return res.json({
    data: notes,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  });
};

exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ message: 'A title and content are required.' });
  }

  const note = await Note.create({
    user: req.user.id,
    title: title.trim(),
    content: content.trim(),
  });
  return res.status(201).json({ data: note });
};

exports.getNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid note ID.' });
  }

  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
  const note = await Note.findOne(filter).populate('user', 'name email');
  if (!note) {
    return res.status(404).json({ message: 'Note not found.' });
  }
  return res.json({ data: note });
};

exports.updateNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid note ID.' });
  }

  const updates = {};
  if (Object.hasOwn(req.body, 'title')) {
    if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
      return res.status(400).json({ message: 'Title must be a non-empty string.' });
    }
    updates.title = req.body.title.trim();
  }
  if (Object.hasOwn(req.body, 'content')) {
    if (typeof req.body.content !== 'string' || !req.body.content.trim()) {
      return res.status(400).json({ message: 'Content must be a non-empty string.' });
    }
    updates.content = req.body.content.trim();
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Provide a title or content to update.' });
  }

  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
  const note = await Note.findOneAndUpdate(
    filter,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!note) {
    return res.status(404).json({ message: 'Note not found.' });
  }
  return res.json({ data: note });
};

exports.deleteNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid note ID.' });
  }

  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
  const note = await Note.findOneAndDelete(filter);
  if (!note) {
    return res.status(404).json({ message: 'Note not found.' });
  }
  return res.status(204).end();
};