const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/admin");
const revokedTokens = new Set();

function checkAdminRole(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { adminId, role } = decoded;

    if (role === "Super Admin" || role === "Admin") {
      req.adminId = adminId;
      next();
    } else {
      return res.status(403).json({ error: "Permission denied" });
    }
  });
}

module.exports.protectedRoute = (req, res) => {
  res.status(200).json({ message: "Admin Protected Route Accessed" });
};

module.exports.signIn = (req, res) => {
  const { email, password } = req.body;

  AdminModel.findOne({ email: email })
    .then((admin) => {
      if (admin) {
        bcrypt.compare(password, admin.password, (err, result) => {
          if (result) {
            const accessToken = jwt.sign(
              { adminId: admin._id },
              process.env.JWT_SECRET,
              {
                expiresIn: "15m",
              }
            );

            res.status(200).json({
              message: "Login Successful",
              data: {
                email: admin.email,
                username: admin.username,
              },
              accessToken,
            });
          } else {
            res
              .status(401)
              .json({ error: { message: "Incorrect Password", err } });
          }
        });
      } else {
        res.status(404).json({ error: { message: "Email not register" } });
      }
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: { message: "Error while signing in", err } });
    });
};

module.exports.addAdmin = (req, res) => {
  const { username, email, password, role } = req.body;
  AdminModel.findOne({ email })
    .then((existingAdmin) => {
      if (existingAdmin) {
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
          const newAdmin = new AdminModel({
            username,
            email,
            password: hashedPassword,
            role,
          });
          newAdmin
            .save()
            .then((admin) => {
              const accessToken = jwt.sign(
                { adminId: admin._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: "15m",
                }
              );
              res.status(201).json({
                message: "Register successfully",
                data: {
                  id: admin._id,
                  email: admin.email,
                  username: admin.username,
                  role: admin.role,
                  createdAt: admin.createdAt,
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
