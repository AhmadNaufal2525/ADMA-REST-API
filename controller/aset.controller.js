const AsetModel = require("../model/aset.model");

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

module.exports = { getAllAset, getAssetByTagNumber, addNewAset };