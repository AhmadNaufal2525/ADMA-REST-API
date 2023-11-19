const jwt = require('jsonwebtoken');
const User = require('../model/users.model');
const bcrypt = require('bcrypt');

const register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username is already in use' });
    }
    const user = new User({ username, email, password:hashedPassword, role });
    await user.save();
    const responseData = {
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
    res.status(201).json(responseData);
  } catch (error) {
    next(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not registered' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '3 hours'
    });

    res.cookie('token', token, { httpOnly: true, expiresIn: '3 hours' });

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    res.json(responseData);
  } catch (error) {
    next(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const logout = (req, res) => {
  
  res.clearCookie('token');

  res.json({ message: 'Logout successful' });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};


module.exports = { register, login, getAllUsers, logout };