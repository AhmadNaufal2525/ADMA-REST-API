const AsetModel = require("../model/aset.model");
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const PeminjamanModel = require("../model/peminjaman.model");
const PengembalianModel = require("../model/pengembalian.model");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('csvFile');

const getAllAset = async (req, res) => {
  try {
    AsetModel.find({}).then((aset) => {
      if (aset.length === 0) {
        res.status(404).json({
          error: {
            message: "No assets found",
          },
        });
      } else {
        res.status(200).json({
          message: "Aset retrieved successfully",
          data: aset,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error fetching aset",
        details: err.message,
      },
    });
  }
};

const getAssetByTagNumber = async (req, res) => {
  const tagNumber = req.params.tag_number;
  try {
    AsetModel.findOne({ tag_number: tagNumber }).then((aset) => {
      if (!aset) {
        res.status(404).json({
          error: {
            message: "Aset not found",
          },
        });
      } else {
        res.status(200).json({
          message: "Aset retrieved successfully by tag number",
          data: aset,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error fetching aset",
        details: err.message,
      },
    });
  }
};

const addNewAset = async (req, res) => {
  try {
    const {
      nama_alat,
      tag_number,
      merek,
      tipe,
      nomor_seri,
      penanggung_jawab,
      lokasi_aset,
    } = req.body;

    const existingAsset = await AsetModel.findOne({
      $or: [{ nama_alat }, { tag_number }],
    });

    if (existingAsset) {
      return res.status(400).json({
        error: {
          message: "Aset already exists",
        },
      });
    }

    const newAset = new AsetModel({
      nama_alat,
      tag_number,
      merek,
      tipe,
      nomor_seri,
      lokasi_aset,
      penanggung_jawab,
      is_borrowed: false,
    });

    const savedAset = await newAset.save();

    res.status(201).json({
      message: "Asset added successfully",
      data: savedAset,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error adding asset",
        details: error.message,
      },
    });
  }
};

const getAssetById = async (req, res) => {
  const id = req.params.id;
  try {
    const asset = await AsetModel.findById(id);
    if (!asset) {
      return res.status(404).json({
        error: {
          message: "Asset not found",
        },
      });
    }
    res.status(200).json({
      message: "Asset retrieved successfully by ID",
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error fetching asset",
        details: error.message,
      },
    });
  }
};

const updateAssetById = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedAsset = await AsetModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedAsset) {
      return res.status(404).json({
        error: {
          message: "Asset not found",
        },
      });
    }
    res.status(200).json({
      message: "Asset updated successfully",
      data: updatedAsset,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error updating asset",
        details: error.message,
      },
    });
  }
};

const deleteAssetById = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedAsset = await AsetModel.findByIdAndDelete(id);
    if (!deletedAsset) {
      return res.status(404).json({
        error: {
          message: "Asset not found",
        },
      });
    }
    res.status(200).json({
      message: "Asset deleted successfully",
      data: deletedAsset,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error deleting asset",
        details: error.message,
      },
    });
  }
};

const addNewAsetFromCSV = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          error: {
            message: "Error uploading file",
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
      const file = req.file;
      if (!file || file.mimetype !== 'text/csv') {
        return res.status(400).json({
          error: {
            message: "Please upload a CSV file",
          },
        });
      }

      const results = [];
      fs.createReadStream(file.buffer)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const insertedAssets = [];
          for (const row of results) {
            const newAset = new AsetModel({
              nama_alat: row.nama_alat,
              tag_number: row.tag_number,
              merek: row.merek,
              tipe: row.tipe,
              nomor_seri: row.nomor_seri,
              penanggung_jawab: row.penanggung_jawab,
              lokasi_aset: row.lokasi_aset,
              is_borrowed: false,
            });
            const savedAset = await newAset.save();
            insertedAssets.push(savedAset);
          }

          res.status(201).json({
            message: "Assets added successfully from CSV",
            data: insertedAssets,
          });
        });
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Error adding assets from CSV",
        details: error.message,
      },
    });
  }
};

const getAllHistory = async (req, res) => {
  try {
    const [peminjaman, pengembalian] = await Promise.all([
      PeminjamanModel.find().populate("id_aset").populate("id_user", "username"),
      PengembalianModel.find().populate("id_aset").populate("id_user", "username")
    ]);

    const history = [
      ...peminjaman.map(item => ({ ...item.toObject(), jenis: "Peminjaman" })),
      ...pengembalian.map(item => ({ ...item.toObject(), jenis: "Pengembalian" }))
    ];

    res.status(200).json({
      message: "Daftar riwayat berhasil diambil",
      history
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar riwayat: " + error.message });
  }
};



module.exports = { getAllAset, getAssetByTagNumber, addNewAset, getAssetById, updateAssetById, deleteAssetById, addNewAsetFromCSV, getAllHistory };