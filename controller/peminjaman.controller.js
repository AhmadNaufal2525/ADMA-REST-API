const AsetModel = require("../model/aset.model");
const UserModel = require("../model/users.model");
const PeminjamanModel = require("../model/peminjaman.model");
const PeminjamanHistoryModel = require("../model/peminjamanHistory.model");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

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

const sendNotification = async (deviceToken, title, body) => {
  const url = "https://fcm.googleapis.com/fcm/send";
  const headers = {
    "Content-Type": "application/json",
    Authorization:`key=${process.env.FCM_SERVER_KEY}`,
  };

  try {
    const response = await axios.post(
      url,
      {
        to: deviceToken,
        notification: {
          title: title,
          body: body,
        },
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    throw new Error("Error sending notification: " + error.message);
  }
};

const acceptPeminjaman = async (req, res) => {
  try {
    const peminjamanId = req.params.id;
    const adminId = req.body.adminId;
    const peminjaman = await PeminjamanModel.findById(peminjamanId);

    if (!peminjaman) {
      return res.status(404).json({ error: "Peminjaman not found" });
    }

    if (peminjaman.status === "Approved") {
      return res.status(400).json({ error: "Peminjaman already approved" });
    }

    const aset = await AsetModel.findById(peminjaman.id_aset);
    if (!aset) {
      return res.status(404).json({ error: "Corresponding asset not found" });
    }

    peminjaman.status = "Approved";
    await peminjaman.save();

    const historyEntry = new PeminjamanHistoryModel({
      id_peminjaman: peminjaman._id,
      id_user: peminjaman.id_user,
      action: "Approved",
      id_admin: adminId,
    });
    await historyEntry.save();
    const userDeviceToken = process.env.USER_DEVICE_TOKEN; 
    const notificationTitle = "Peminjaman Disetujui";
    const notificationBody = "Peminjaman Anda telah disetujui.";
    await sendNotification(
      userDeviceToken,
      notificationTitle,
      notificationBody
    );

    setTimeout(async () => {
      try {
        const approvedPeminjaman = await PeminjamanModel.findByIdAndDelete(
          peminjamanId
        );
        if (!approvedPeminjaman) {
          console.log("Peminjaman not found");
        } else {
          console.log(
            "Peminjaman telah dihapus setelah 1 jam:",
            approvedPeminjaman
          );
        }
      } catch (error) {
        console.error("Error deleting peminjaman:", error);
      }
    }, 1 * 60 * 60 * 1000);

    res
      .status(200)
      .json({ message: "Peminjaman accepted", peminjaman, adminId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error accepting peminjaman: " + error.message });
  }
};

const rejectPeminjaman = async (req, res) => {
  try {
    const peminjamanId = req.params.id;
    const adminId = req.body.adminId;
    const peminjaman = await PeminjamanModel.findById(peminjamanId);

    if (!peminjaman) {
      return res.status(404).json({ error: "Peminjaman not found" });
    }

    if (peminjaman.status === "Rejected") {
      return res.status(400).json({ error: "Peminjaman already rejected" });
    }

    const aset = await AsetModel.findById(peminjaman.id_aset);
    if (!aset) {
      return res.status(404).json({ error: "Corresponding asset not found" });
    }

    const historyEntry = new PeminjamanHistoryModel({
      id_peminjaman: peminjaman._id,
      id_user: peminjaman.id_user,
      action: "Rejected",
      id_admin: adminId,
    });

    peminjaman.status = "Rejected";
    await historyEntry.save();
    await peminjaman.save();

    setTimeout(async () => {
      try {
        const rejectedPeminjaman = await PeminjamanModel.findByIdAndDelete(
          peminjamanId
        );
        if (!rejectedPeminjaman) {
          console.log("Peminjaman not found");
        } else {
          console.log(
            "Peminjaman telah dihapus setelah 1 jam:",
            rejectedPeminjaman
          );
        }
      } catch (error) {
        console.error("Error deleting peminjaman:", error);
      }
    }, 1 * 60 * 60 * 1000);

    res
      .status(200)
      .json({ message: "Peminjaman rejected", peminjaman, adminId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error rejecting peminjaman: " + error.message });
  }
};

const getPeminjamanByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const peminjaman = await PeminjamanModel.find({ id_user: userId }).populate(
      "id_aset"
    );

    if (peminjaman.length === 0) {
      return res
        .status(404)
        .json({ error: "Tidak ada peminjaman untuk pengguna ini" });
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
      .populate("id_peminjaman", "id_aset")
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

const getPeminjamanHistory = async (req, res) => {
  try {
    const peminjamanHistory = await PeminjamanHistoryModel.find()
      .populate({
        path: "id_peminjaman",
        populate: { path: "id_aset" },
      })
      .populate("id_user", "username")
      .populate("id_admin", "username");

    if (peminjamanHistory.length === 0) {
      return res
        .status(404)
        .json({ error: "No history found for this peminjaman" });
    }

    res.status(200).json({
      message: "Peminjaman history retrieved successfully",
      peminjamanHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving peminjaman history: " + error.message });
  }
};

const getPeminjamanHistoryById = async (req, res) => {
  try {
    const peminjamanHistoryId = req.params.id;
    const peminjamanHistory = await PeminjamanHistoryModel.findById(
      peminjamanHistoryId
    )
      .populate({
        path: "id_peminjaman",
        populate: { path: "id_aset" },
      })
      .populate("id_user", "username")
      .populate("id_admin", "username");

    if (peminjamanHistory.length === 0) {
      return res
        .status(404)
        .json({ error: "No history found for this peminjaman ID" });
    }

    res.status(200).json({
      message: "Peminjaman history retrieved successfully",
      peminjamanHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving peminjaman history: " + error.message });
  }
};

module.exports = {
  createPeminjaman,
  getAllPeminjaman,
  getPeminjamanByUserId,
  rejectPeminjaman,
  acceptPeminjaman,
  getPeminjamanById,
  getPeminjamanHistory,
  getPeminjamanHistoryById,
};
