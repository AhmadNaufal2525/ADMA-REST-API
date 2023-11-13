const jwt = require('jsonwebtoken');
const User = require('../model/users.model');
const blacklist = [];

const register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username is already in use' });
    }
    const user = new User({ username, email, password, role });
    await user.save();
    const responseData = {
      message: 'Registration successful',
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error during registration:', error);
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
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const responseData = {
      message: 'Login successful',
      token: jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: '3 hours'
      }),
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
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

const logout = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    blacklist.push(token);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};


module.exports = { register, login, getAllUsers, logout};
