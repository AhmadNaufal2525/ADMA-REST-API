const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/users.route');
const asetRouter = require("./routes/aset.route");
const peminjamanRouter = require("./routes/peminjaman.route");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/data', asetRouter);
app.use('/api/v1/aset', peminjamanRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});