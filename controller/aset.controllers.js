const AsetModel = require("../models/aset");

module.exports.getAssets = (req, res) => {
  AsetModel.find({}).lean()
    .then((assets) => {
      if (assets.length === 0) {
        res.status(404).json({
          error: {
            message: "No assets found",
          },
        });
      } else {
        res.status(200).json({
          message: "Assets retrieved successfully",
          data: assets,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: "Error fetching assets",
          details: err.message,
        },
      });
    });
};

module.exports.getAssetByName = (req, res) => {
  const assetName = req.params.nama_alat;

  AsetModel.findOne({ nama_alat: assetName })
    .then((asset) => {
      if (!asset) {
        res.status(404).json({
          error: {
            message: "Asset not found",
          },
        });
      } else {
        res.status(200).json({
          message: "Asset retrieved successfully",
          data: asset,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: "Error fetching asset",
          details: err.message,
        },
      });
    });
};

module.exports.getAssetByTagNumber = (req, res) => {
  const tagNumber = req.params.tag_number;

  AsetModel.findOne({ tag_number: tagNumber })
    .then((asset) => {
      if (!asset) {
        res.status(404).json({
          error: {
            message: "Asset not found",
          },
        });
      } else {
        res.status(200).json({
          message: "Asset retrieved successfully by tag number",
          data: asset,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: "Error fetching asset",
          details: err.message,
        },
      });
    });
};

module.exports.addNewAsset = (req, res) => {
  const { nama_alat, tag_number, merek, tipe, nomor_seri, penanggung_jawab } = req.body;
  AsetModel.findOne({ $or: [{ nama_alat }, { tag_number }] })
    .then((existingAsset) => {
      if (existingAsset) {
        res.status(400).json({
          error: {
            message: "Asset already exists",
          },
        });
      } else {
        const newAsset = new AsetModel({
          nama_alat,
          tag_number,
          merek,
          tipe,
          nomor_seri,
          penanggung_jawab,
          is_borrowed: false,
        });

        newAsset
          .save()
          .then((asset) => {
            res.status(201).json({
              message: "Asset added successfully",
              data: asset,
            });
          })
          .catch((err) => {
            res.status(500).json({
              error: {
                message: "Error adding asset",
                details: err.message,
              },
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: {
          message: "Error checking for existing assets",
          details: err.message,
        },
      });
    });
};



