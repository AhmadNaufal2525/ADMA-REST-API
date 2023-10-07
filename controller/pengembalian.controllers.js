const PengembalianModel = require('../models/pengembalian');
const AsetModel = require('../models/aset');

app.post("/api/v1/aset/pengembalian/:assetId", verifyToken, async (req, res) => {
   try {
      const { assetId } = req.params;
      const { userId } = req;
      const newPengembalian = new PengembalianModel({
         assetId,
         userId,
         lokasi: req.body.lokasi,
         kondisi_aset: req.body.kondisi_aset,
         tanggal_pengembalian: req.body.tanggal_pengembalian,
         foto: req.body.foto,
      });
      await newPengembalian.save();
      
      const assetToUpdate = await AsetModel.findOneAndUpdate(
         { _id: assetId },
         { $set: { is_borrowed: false } },
         { new: true }
      );

      res.status(201).json({ message: "Asset returned successfully", asset: assetToUpdate });
   } catch (error) {
      console.error("Error returning asset:", error);
      res.status(500).json({ error: "Internal server error" });
   }
});
