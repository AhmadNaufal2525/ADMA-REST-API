const UserModel = require('../model/users.model');
const {initializeApp} = require('firebase/app');
const AsetModel = require("../model/aset.model");
const PeminjamanModel = require('../model/peminjaman.model');
const PengembalianModel = require('../model/pengembalian.model');
const config = require('../config/firebase.config');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require('multer');


initializeApp(config.firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const createPengembalian = async (req, res) => {
  try {
    upload.single('photo')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          error: {
            message: "Multer error",
            details: err.message,
          },
        });
      } else if (err) {
        return res.status(500).json({
          error: {
            message: "Error uploading file",
            details: err.message,
          },
        });
      }

      const {
        kondisi_aset,
        tanggal_pengembalian,
        lokasi,
        tagNumber,
        username,
      } = req.body;

      const aset = await AsetModel.findOne({ tag_number: tagNumber });

      if (!aset) {
        return res.status(404).json({
          error: {
            message: "Asset not found",
          },
        });
      }

      if (!aset.is_borrowed) {
        return res.status(400).json({
          error: {
            message: "Asset is not currently borrowed",
          },
        });
      }

      const user = await UserModel.findOne({ username });

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
          },
        });
      }

      const existingPeminjaman = await PeminjamanModel.findOne({
        id_aset: aset._id,
        id_user: user._id,
        status: "Pending",
      });

      if (!existingPeminjaman) {
        return res.status(400).json({
          error: {
            message: "No pending borrowing found for this asset and user",
          },
        });
      }

      const photoFile = req.file;
      if (!photoFile || !photoFile.buffer) {
        return res.status(400).json({
          error: {
            message: "File data is missing or invalid",
          },
        });
      }

      const photoFileName = `Aset${existingPeminjaman._id}_${Date.now()}.jpg`;
      const storageRef = ref(storage, photoFileName);

      const photoSnapshot = await uploadBytesResumable(storageRef, photoFile.buffer);
      const photoURL = await getDownloadURL(photoSnapshot.ref);

      const newPengembalian = new PengembalianModel({
        lokasi,
        kondisi_aset,
        tanggal_pengembalian,
        status: "Pending",
        jenis: "Pengembalian",
        id_aset: aset._id,
        id_user: user._id,
        foto: photoURL,
      });

      const savedPengembalian = await newPengembalian.save();

      aset.is_borrowed = false;
      await aset.save();

      existingPeminjaman.status = "-";
      await existingPeminjaman.save();

      res.status(201).json({
        message: "Pengembalian berhasil dibuat",
        pengembalian: savedPengembalian,
      });
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error creating pengembalian",
        details: error.message,
      },
    });
  }
};

module.exports = { createPengembalian };
