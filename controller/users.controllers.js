const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UsersModel = require("../models/users");
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
                email: user.email,
                username: user.username,
              },
              accessToken,
            });
          } else {
            res.status(401).json({ error: { message: "Incorrect Password", err } });
          }
        });
      } else {
        res.status(404).json({ error: { message: "User not found", err } });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: { message: "Error while signing in"} });
    });
};

module.exports.protectedRoute = (req, res) => {
  res.status(200).json({ message: "Protected Route Accessed", userId: req.userId });
};

module.exports.signUp = (req, res) => {
  const { username, email, password, unit } = req.body;
  UsersModel.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(400)
          .json({ error: { message: "Email already exists" } });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res
              .status(500)
              .json({ error: { message: "Error hashing password" } });
          }
          const newUser = new UsersModel({
            username,
            email,
            password: hashedPassword,
            unit
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
                  id: user._id,
                  email: user.email,
                  username: user.username,
                  unit: user.unit,
                  createdAt: user.createdAt
                },
                accessToken,
              });
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ error: { message: "Error creating user" } });
            });
        });
      }
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ error: { message: "Error checking email existence" } });
    });
};


module.exports.logout = (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }
  revokedTokens.add(token);

  res.status(200).json({ message: "Logout successful" });
};

module.exports.getAllUsers = (req,res) => {
  UsersModel.find({})
    .then((users) => {
      res.status(200).json({
        message: "Sucessfull Load List Users",
        data: users.map((user) => ({
          id: user._id,
          email: user.email,
          username: user.username,
          unit: user.unit,
          createdAt: user.createdAt
        })),
      });
    })
    .catch((err) => {
      res.status(500).json({ error: { message: "Error fetching users" } });
    });
};

module.exports.getUserByUsername = (req, res) => {
  const username = req.params.username;

  UsersModel.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: { message: "User not found" } });
      }

      res.status(200).json({
        message: "Successful Load User By Username",
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
      res.status(500).json({ error: { message: "Error fetching user" } });
    });
};





