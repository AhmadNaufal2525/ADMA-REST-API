const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/users.route');
const asetRouter = require("./routes/aset.route");
const peminjamanRouter = require("./routes/peminjaman.route");
const serviceAccount = require('./serviceAccountKey.json');
const admin = require('firebase-admin');

require("dotenv").config();

const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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