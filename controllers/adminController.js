const mongoose = require('mongoose');
const Note = require('../models/Note');
const Post = require('../models/Post');
const User = require('../models/User');

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);

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

exports.listUsers = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    return res.status(400).json({ message: 'Page must be positive and limit must be between 1 and 100.' });
  }

  const [users, total] = await Promise.all([
    User.find()
      .select('name email role interests createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit),
    User.countDocuments(),
  ]);

  return res.json({
    data: users,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  });
};

exports.updateUserRole = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be either user or admin.' });
  }
  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'You cannot remove your own admin role.' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true, runValidators: true }
  ).select('name email role interests createdAt updatedAt');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ data: user });
};

// Scenario 1: Group Users by Interests (Exact single collection.aggregate call)
exports.groupByInterests = async (req, res) => {
  const result = await User.aggregate([
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        users: {
          $push: {
            id: '$_id',
            name: '$name',
            email: '$email',
          },
        },
        userCount: { $sum: 1 },
      },
    },
    { $sort: { userCount: -1 } },
  ]);

  return res.json({ data: result });
};

// Scenario 2: Retrieve posts belonging to a particular user using $lookup
exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  const result = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'user',
        as: 'posts',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        posts: 1,
      },
    },
  ]);

  if (!result.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ data: result[0] });
};