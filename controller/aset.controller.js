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

module.exports = { getAllAset, getAssetByTagNumber, addNewAset, getAssetById, updateAssetById, deleteAssetById };