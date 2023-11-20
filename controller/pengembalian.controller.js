const AsetModel = require("../model/aset.model");
const UserModel = require('../model/users.model');
const PengembalianModel = require('../model/pengembalian.model');
const firebase = require('firebase/app');
const storage = require('firebase/storage');
const firebaseConfig = {
    apiKey: "AIzaSyCApOuAwpMaGSiWzVM3drvbNQP2ewtBmQ4",
    authDomain: "sima-restapi.firebaseapp.com",
    projectId: "sima-restapi",
    storageBucket: "sima-restapi.appspot.com",
    messagingSenderId: "818181470773",
    appId: "1:818181470773:web:dbd3f20aef5d2094a2cf7c"
};
firebase.initializeApp(firebaseConfig);

const createPengembalian = async (req, res) => {
  try {
    const {
      kondisi_aset,
      tanggal_pengembalian,
      lokasi,
      id_aset,
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
      id_aset,
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

    const photoFile = req.file;
    const photoFileName = `pengembalian_${savedPengembalian._id}_${Date.now()}.jpg`;
    const photoRef = storage.ref().child(photoFileName);
    const photoSnapshot = await photoRef.put(photoFile.buffer);

    const photoURL = await photoSnapshot.ref.getDownloadURL();

    const savedPengembalian = await newPengembalian.save();

    aset.is_borrowed = false;
    await aset.save();

    existingPeminjaman.status = "Completed";
    await existingPeminjaman.save();

    res.status(201).json({
      message: "Pengembalian berhasil dibuat",
      pengembalian: savedPengembalian,
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