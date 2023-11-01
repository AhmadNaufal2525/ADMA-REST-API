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
              data: {
                status: 200,
                id: user._id,
                email: user.email,
                username: user.username,
                accessToken,
              },
            });
          } else {
            res.status(401).json({
              message: "Incorrect Password",
              data: {
                status: 401,
              }
            });
          }
        });
      } else {
        res.status(404).json({
          message: "Email not registered",
          data: {
            status: 404, 
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error while signing in",
        data: {
          status: 500,
          error: err,
        }
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
          data: {
            status: 400,
            error: { message: "Email already exists" },
          },
        });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({
              message: "Error hashing password",
              data: {
                status: 500,
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
                data: {
                  status: 201,
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
                data: {
                  status: 500,
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
        data: {
          status: 500,
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
        data: {
          status: 200,
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
        data: {
          status: 500,
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
          data: {
            status: 404,
            error: { message: "User not found" },
          },
        });
      }

      res.status(200).json({
        message: "Successful Load User By Username",
        data: {
          status: 200,
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
        data: {
          status: 500,
          error: err,
        },
      });
    });
};






