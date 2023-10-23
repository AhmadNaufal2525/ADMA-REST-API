const PengembalianModel = require('../models/pengembalian.model');
const AsetModel = require('../models/aset.model');
const UserModel = require('../models/users.model');

module.exports.createPengembalian = (req, res) => {
  const { lokasi, kondisi_aset, tanggal_pengembalian, foto, id_user, id_aset } = req.body;
  UserModel.findOne({ _id: id_user })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
          },
        });
      }

      AsetModel.findOne({ _id: id_aset })
        .then((asset) => {
          if (!asset) {
            return res.status(404).json({
              error: {
                message: "Asset not found",
              },
            });
          }

          const newPengembalian = new PengembalianModel({
            lokasi,
            kondisi_aset,
            tanggal_pengembalian,
            foto,
            id_user,
            id_aset,
            status: "Pending",
          });

          newPengembalian
            .save()
            .then((pengembalian) => {
              AsetModel.findOneAndUpdate(
                { _id: id_aset },
                { is_borrowed: false },
                { new: true },
                (assetErr, updatedAsset) => {
                  if (assetErr) {
                    return res.status(500).json({
                      error: {
                        message: "Error updating asset status",
                        details: assetErr.message,
                      },
                    });
                  }

                  res.status(201).json({
                    message: "Pengembalian berhasil dibuat",
                    data: {
                      pengembalian,
                      asset: {
                        nama_alat: asset.nama_alat,
                        tag_number: asset.tag_number,
                        merek: asset.merek,
                        tipe: asset.tipe,
                        nomor_seri: asset.nomor_seri,
                        penanggung_jawab: asset.penanggung_jawab,
                        lokasi_aset: asset.lokasi_aset,
                      },
                      user: {
                        username: user.username,
                      },
                    },
                  });
                }
              );
            })
            .catch((pengembalianErr) => {
              res.status(500).json({
                error: {
                  message: "Error creating pengembalian",
                  details: pengembalianErr.message,
                },
              });
            });
        })
        .catch((assetErr) => {
          res.status(500).json({
            error: {
              message: "Error finding asset",
              details: assetErr.message,
            },
          });
        });
    })
    .catch((userErr) => {
      res.status(500).json({
        error: {
          message: "Error finding user",
          details: userErr.message,
        },
      });
   });
};

module.exports.getAllPengembalian = async (req, res) => {
   try {
     const pengembalian = await PengembalianModel.find().populate('id_aset').populate('id_user', 'username');
     res.status(200).json({ message: 'Daftar pengembalian berhasil diambil', pengembalian });
   } catch (error) {
     res.status(500).json({ error: 'Gagal mengambil daftar pengembalian: ' + error.message });
   }
 };
