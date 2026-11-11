const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required.' });
  }

  const post = await Post.create({
    title,
    body,
    user: req.user.id, // Auth middleware from logged in user ID
  });

  return res.status(201).json({ data: post });
};