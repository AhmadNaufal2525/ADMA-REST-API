const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/users.route");
const asetsRouter = require("./routes/asets.route");
const adminRouter = require("./routes/admin.route");
const pinjamRouter = require("./routes/peminjaman.route");
const pengembalianRouter = require("./routes/pengembalian.route")
// const { verifyToken } = require("./middleware/verifyToken");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// app.use(verifyToken)
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/data', asetsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/aset', pinjamRouter);
app.use('/api/v1/aset', pengembalianRouter);


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});