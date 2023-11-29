const UserModel = require('../model/users.model');
const {initializeApp} = require('firebase/app');
const AsetModel = require("../model/aset.model");
const PeminjamanModel = require('../model/peminjaman.model');
const PengembalianModel = require('../model/pengembalian.model');
const config = require('../config/firebase.config');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require('multer');
const PengembalianHistoryModel = require('../model/pengembalianHIstory.model');


initializeApp(config.firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const createPengembalian = async (req, res) => {
  try {
    upload.single('foto')(req, res, async function (err) {
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
        status: "Approved",
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

      const photoFileName = `Aset:${existingPeminjaman._id}`;
      const storageRef = ref(storage, photoFileName);

      const metadata = {
        contentType: 'image/png'
      };
      
      const photoSnapshot = await uploadBytesResumable(storageRef, photoFile.buffer, metadata);
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

      await aset.save();

      existingPeminjaman.status = "Available";
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

const getAllPengembalian = async (req, res) => {
  try {
    const pengembalian = await PengembalianModel.find()
      .populate("id_aset")
      .populate("id_user", "username");
    res
      .status(200)
      .json({ message: "Daftar pengambalian berhasil diambil", pengembalian });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil daftar pengembalian: " + error.message });
  }
};

const getPengembalianByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const pengembalian = await PengembalianModel.find({ id_user: userId }).populate(
      "id_aset"
    );

    if (pengembalian.length === 0) {
      return res.status(404).json({ error: "Tidak ada pengembalian untuk pengguna ini" });
    }

    res.status(200).json({ message: "Pengembalian berhasil diambil", pengembalian });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil pengembalian: " + error.message });
  }
};


const getPengembalianById = async (req, res) => {
  const pengembalianId = req.params.id;
  try {
    const pengembalian = await PengembalianModel.findById(pengembalianId)
      .populate("id_aset")
      .populate("id_user", "username");

    if (!pengembalian) {
      return res.status(404).json({ message: "Pengembalian not found" });
    }

    res
      .status(200)
      .json({ message: "Pengembalian berhasil diambil", pengembalian });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil pengembalian: " + error.message });
  }
};

const acceptPengembalian = async (req, res) => {
  try {
    const pengambalianId = req.params.id;
    const adminId = req.body.adminId;
    const pengembalian = await PengembalianModel.findById(pengambalianId);

    if (!pengembalian) {
      return res.status(404).json({ error: 'Pengembalian not found' });
    }

    if (pengembalian.status === 'Approved') {
      return res.status(400).json({ error: 'Peminjaman already approved' });
    }

    const aset = await AsetModel.findById(pengembalian.id_aset);
    if (!aset) {
      return res.status(404).json({ error: 'Corresponding asset not found' });
    }
    aset.is_borrowed = false;
    await aset.save();

    const historyEntry = new PengembalianHistoryModel({
      id_pengembalian: pengembalian._id,
      id_user: pengembalian.id_user,
      action: 'Approved',
      id_admin: adminId,
    });
    
    pengembalian.status = "Approved";
    await pengembalian.save();
    await historyEntry.save();

    setTimeout(async () => {
      try {
        const approvedPengembalian = await PengembalianModel.findByIdAndDelete(pengambalianId);
        if (!approvedPengembalian) {
          console.log('Pengembalian not found');
        } else {
          console.log('Pengembalian telah dihapus setelah 1 jam:', approvedPengembalian);
        }
      } catch (error) {
        console.error('Error deleting pengembalian:', error);
      }
    }, 1 * 60 * 60 * 1000);

    res.status(200).json({ message: 'Pengembalian accepted', pengembalian, adminId });
  } catch (error) {
    res.status(500).json({ error: 'Error accepting pengembalian: ' + error.message });
  }
};


const rejectPengembalian = async (req, res) => {
  try {
    const pengambalianId = req.params.id;
    const adminId = req.body.adminId;
    const pengembalian = await PengembalianModel.findById(pengambalianId);

    if (!pengembalian) {
      return res.status(404).json({ error: 'Pengembalian not found' });
    }

    if (pengembalian.status === 'Approved') {
      return res.status(400).json({ error: 'Peminjaman already approved' });
    }

    const aset = await AsetModel.findById(pengembalian.id_aset);
    if (!aset) {
      return res.status(404).json({ error: 'Corresponding asset not found' });
    }

    const historyEntry = new PengembalianHistoryModel({
      id_pengembalian: pengembalian._id,
      id_user: pengembalian.id_user,
      action: 'Rejected',
      id_admin: adminId,
    });
    
    pengembalian.status = "Rejected";
    await pengembalian.save();
    await historyEntry.save();

    setTimeout(async () => {
      try {
        const approvedPengembalian = await PengembalianModel.findByIdAndDelete(pengambalianId);
        if (!approvedPengembalian) {
          console.log('Pengembalian not found');
        } else {
          console.log('Pengembalian telah dihapus setelah 1 jam:', approvedPengembalian);
        }
      } catch (error) {
        console.error('Error deleting pengembalian:', error);
      }
    }, 1 * 60 * 60 * 1000);

    res.status(200).json({ message: 'Pengembalian accepted', pengembalian, adminId });
  } catch (error) {
    res.status(500).json({ error: 'Error accepting pengembalian: ' + error.message });
  }
};

const getPengembalianHistory = async (req, res) => {
  try {
    const pengembalianHistory = await PengembalianHistoryModel.find()
      .populate({
        path: 'id_pengembalian',
        populate: { path: 'id_aset' }
      })
      .populate('id_aset')
      .populate('id_user','username')
      .populate('id_admin', 'username');

    if (pengembalianHistory.length === 0) {
      return res.status(404).json({ error: 'No pengembalian history found' });
    }

    res.status(200).json({
      message: 'Pengembalian history retrieved successfully',
      pengembalianHistory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving pengembalian history: ' + error.message });
  }
};

const getPengembalianHistoryById = async (req, res) => {
  try {
    const pengembalianHistoryId = req.params.id;
    const pengembalianHistory = await PengembalianHistoryModel.findById(pengembalianHistoryId)
      .populate({
        path: 'id_pengembalian',
        populate: { path: 'id_aset' }
      })
      .populate('id_user','username')
      .populate('id_admin', 'username');

    if (!pengembalianHistory) {
      return res.status(404).json({ error: 'Pengembalian history not found' });
    }

    res.status(200).json({
      message: 'Pengembalian history retrieved successfully',
      pengembalianHistory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving pengembalian history: ' + error.message });
  }
};

module.exports = { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId, rejectPengembalian, acceptPengembalian, getPengembalianHistory, getPengembalianHistoryById };
