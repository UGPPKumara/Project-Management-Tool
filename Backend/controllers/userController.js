const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Create a new user (for admin)
exports.createUser = async (req, res) => {
  const { username, password, role, name, email } = req.body;
  try {
    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ msg: 'Username already exists' });
    }
    
    user = await User.findOne({ where: { email } });
    if (user) {
        return res.status(400).json({ msg: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      username,
      password: hashedPassword,
      role,
      name,
      email,
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Update a user (for admin)
exports.updateUser = async (req, res) => {
  const { username, role, name, email } = req.body;
  try {
    let user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.update({ username, role, name, email });
    res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Delete a user (for admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    await user.destroy();
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};