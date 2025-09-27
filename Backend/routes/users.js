const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  next();
};

router.get('/', [auth, isAdmin], getAllUsers);
router.post('/', [auth, isAdmin], createUser);
router.put('/:id', [auth, isAdmin], updateUser);
router.delete('/:id', [auth, isAdmin], deleteUser);

module.exports = router;