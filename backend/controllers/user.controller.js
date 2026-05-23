const User = require('../models/User');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users: users.map(formatUser) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
