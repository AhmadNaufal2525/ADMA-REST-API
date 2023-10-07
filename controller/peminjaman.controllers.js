const PeminjamanModel = require('../models/peminjaman');
const AsetModel = require('../models/aset');
const UsersModel = require('../models/users');

app.post("/api/v1/aset/peminjaman/:assetName", async (req, res) => {
   try {
      const { assetName } = req.params.nama_alat;
      const { username } = req.params.username;
      const user = await UsersModel.findOne({ username });

      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }
      const asset = await AsetModel.findOne({ nama_alat: assetName });

      if (!asset) {
         return res.status(404).json({ error: "Asset not found" });
      }

      const newPeminjaman = new PeminjamanModel({
         userId: user._id,
         lokasi: req.body.lokasi,
         kondisi_aset: req.body.kondisi_aset,
         tanggal_peminjaman: req.body.tanggal_peminjaman,
         tujuan_peminjaman: req.body.tujuan_peminjaman,
         status: "Pending", 
      });
      
      await newPeminjaman.save();
      asset.is_borrowed = true;
      await asset.save();

      res.status(201).json({ message: "Asset borrowed successfully", asset: asset });
   } catch (error) {
      console.error("Error borrowing asset:", error);
      res.status(500).json({ error: "Internal server error" });
   }
});
