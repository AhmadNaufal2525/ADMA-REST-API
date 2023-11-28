const AsetModel = require("../model/aset.model");
const UserModel = require('../model/users.model');
const PeminjamanModel = require('../model/peminjaman.model');
const PeminjamanHistoryModel = require('../model/peminjamanHistory.model');

const createPeminjaman = async (req, res) => {
  try {
    const {
      lokasi,
      kondisi_aset,
      tanggal_peminjaman,
      tujuan_peminjaman,
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

    if (aset.is_borrowed) {
      return res.status(400).json({
        error: {
          message: "Asset is already borrowed",
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

    const newPeminjaman = new PeminjamanModel({
      lokasi,
      kondisi_aset,
      tanggal_peminjaman,
      tujuan_peminjaman,
      id_aset: aset._id,
      id_user: user._id,
      status: "Pending",
      jenis: "Peminjaman",
    });

    const savedPeminjaman = await newPeminjaman.save();

    aset.is_borrowed = false;
    await aset.save();

    res.status(201).json({
      message: "Peminjaman berhasil dibuat",
      peminjaman: savedPeminjaman,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error creating peminjaman",
        details: error.message,
      },
    });
  }
};

const getAllPeminjaman = async (req, res) => {
    try {
      const peminjaman = await PeminjamanModel.find()
        .populate("id_aset")
        .populate("id_user", "username");
      res
        .status(200)
        .json({ message: "Daftar peminjaman berhasil diambil", peminjaman });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Gagal mengambil daftar peminjaman: " + error.message });
    }
};

const acceptPeminjaman = async (req, res) => {
  try {
    const peminjamanId = req.params.id;
    const adminId = req.body.adminId;
    const peminjaman = await PeminjamanModel.findById(peminjamanId);

    if (!peminjaman) {
      return res.status(404).json({ error: 'Peminjaman not found' });
    }

    const aset = await AsetModel.findById(peminjaman.id_aset);
    if (!aset) {
      return res.status(404).json({ error: 'Corresponding asset not found' });
    }
    aset.is_borrowed = true;
    await aset.save();

    const historyEntry = new PeminjamanHistoryModel({
      id_peminjaman: peminjaman._id,
      id_user: peminjaman.id_user,
      action: 'Approved',
      id_admin: adminId,
    });

    await historyEntry.save();

    const approvedPeminjaman = await PeminjamanModel.findByIdAndDelete(peminjamanId);
    if (!approvedPeminjaman) {
      return res.status(404).json({ error: 'Peminjaman not found' });
    }

    res.status(200).json({ message: 'Peminjaman accepted', peminjaman, adminId });
  } catch (error) {
    res.status(500).json({ error: 'Error accepting peminjaman: ' + error.message });
  }
};

const rejectPeminjaman = async (req, res) => {
  try {
    const peminjamanId = req.params.id;
    const userId = req.params.id;
    const peminjaman = await PeminjamanModel.findById(peminjamanId);

    if (!peminjaman) {
      return res.status(404).json({ error: 'Peminjaman not found' });
    }

    const historyEntry = new PeminjamanHistoryModel({
      id_peminjaman: peminjaman._id,
      id_user: userId,
      action: 'rejected',
    });

    await historyEntry.save();

    const deletedPeminjaman = await PeminjamanModel.findByIdAndDelete(peminjamanId);
    if (!deletedPeminjaman) {
      return res.status(404).json({ error: 'Peminjaman not found' });
    }

    res.status(200).json({ message: 'Peminjaman rejected', peminjaman: deletedPeminjaman });
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting peminjaman: ' + error.message });
  }
};


const getPeminjamanByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const peminjaman = await PeminjamanModel.find({ id_user: userId }).populate(
      "id_aset"
    );

    if (peminjaman.length === 0) {
      return res.status(404).json({ error: "Tidak ada peminjaman untuk pengguna ini" });
    }

    res
      .status(200)
      .json({ message: "Peminjaman berhasil diambil", peminjaman });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil peminjaman: " + error.message });
  }
};

const getPeminjamanById = async (req, res) => {
  const peminjamanId = req.params.id;
  try {
    const peminjaman = await PeminjamanModel.findById(peminjamanId)
      .populate("id_aset")
      .populate("id_user", "username");

    if (!peminjaman) {
      return res.status(404).json({ message: "Peminjaman not found" });
    }

    res
      .status(200)
      .json({ message: "Peminjaman berhasil diambil", peminjaman });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil peminjaman: " + error.message });
  }
};


module.exports = { createPeminjaman, getAllPeminjaman, getPeminjamanByUserId, rejectPeminjaman, acceptPeminjaman, getPeminjamanById };
