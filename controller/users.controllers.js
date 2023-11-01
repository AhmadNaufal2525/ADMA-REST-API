const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UsersModel = require("../models/users.model");
const revokedTokens = new Set();
  

module.exports.signIn = (req, res) => {
  const { email, password } = req.body;

  UsersModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            const accessToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              {
                expiresIn: "15m",
              }
            );

            res.status(200).json({
              message: "Login Successful",
              status: 200,
              data: {
                id: user._id,
                email: user.email,
                username: user.username,
                accessToken,
              },
            });
          } else {
            res.status(401).json({
              message: "Incorrect Password",
              status: 401,
            });
          }
        });
      } else {
        res.status(404).json({
          message: "Email not registered",
          status: 404, 
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error while signing in",
        status: 500,
      });
    });
};


module.exports.protectedRoute = (req, res) => {
  res.status(200).json({ message: "Protected Route Accessed", userId: req.userId });
};

module.exports.signUp = (req, res) => {
  const { username, email, password } = req.body;
  UsersModel.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
          status: 400,
          data: {
            error: { message: "Email already exists" },
          },
        });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({
              message: "Error hashing password",
              status: 500,
              data: {
                error: err,
              },
            });
          }
          const newUser = new UsersModel({
            username,
            email,
            password: hashedPassword,
          });
          newUser
            .save()
            .then((user) => {
              const accessToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: "15m",
                }
              );

              res.status(201).json({
                message: "Register successfully",
                status: 201,
                data: {
                  id: user._id,
                  email: user.email,
                  username: user.username,
                  createdAt: user.createdAt,
                },
                accessToken,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Error create account",
                status: 500,
                data: {
                  error: err,
                },
              });
            });
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Error checking email existence",
        status: 500,
        data: {
          error: err,
        },
      });
    });
};

module.exports.logout = (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }
  revokedTokens.add(token);

  res.status(200).json({ message: "Logout successful" });
};

module.exports.getAllUsers = (req, res) => {
  UsersModel.find({})
    .then((users) => {
      res.status(200).json({
        message: "Successful Load List Users",
        status: 500,
        data: {
          users: users.map((user) => ({
            id: user._id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
          })),
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error fetching users",
        status: 500,
        data: {
          error: err,
        },
      });
    });
};

module.exports.getUserByUsername = (req, res) => {
  const username = req.params.username;

  UsersModel.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          status: 404,
          data: {
            error: { message: "User not found" },
          },
        });
      }

      res.status(200).json({
        message: "Successful Load User By Username",
        status: 200,
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          unit: user.unit,
          createdAt: user.createdAt,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error fetching user",
        status: 500,
        data: {
          error: err,
        },
      });
    });
};






