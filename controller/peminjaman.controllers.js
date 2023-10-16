const PeminjamanModel = require('../models/peminjaman.model');
const AsetModel = require('../models/aset.model');
const UserModel = require('../models/users.model');

module.exports.createPeminjaman = (req, res) => {
  const { lokasi, kondisi_aset, tanggal_peminjaman, tujuan_peminjaman, tagNumber, username } = req.body;
  AsetModel.findOne({ tag_number: tagNumber }) 
  .then((asset) => {
    if (!asset) {
      return res.status(404).json({
        error: {
          message: "Asset not found",
        },
      });
    }

      if (asset.is_borrowed) {
        return res.status(400).json({
          error: {
            message: "Asset is already borrowed",
          },
        });
      }

      UserModel.findOne({ username: username })
        .then((user) => {
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
            id_aset: asset._id,
            id_user: user._id,
            status: "Pending",
          });

          newPeminjaman.save()
            .then((peminjaman) => {
              asset.is_borrowed = true;
              asset.save()
                .then(() => {
                  res.status(201).json({
                    message: "Peminjaman berhasil dibuat",
                    data: {
                      peminjaman,
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
                })
                .catch((assetErr) => {
                  res.status(500).json({
                    error: {
                      message: "Error updating asset status",
                      details: assetErr.message,
                    },
                  });
                });
            })
            .catch((peminjamanErr) => {
              res.status(500).json({
                error: {
                  message: "Error creating peminjaman",
                  details: peminjamanErr.message,
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
    })
    .catch((assetErr) => {
      res.status(500).json({
        error: {
          message: "Error finding asset",
          details: assetErr.message,
        },
      });
    });
};


module.exports.getAllPeminjaman = async (req, res) => {
  try {
    const peminjaman = await PeminjamanModel.find().populate('id_aset').populate('id_user', 'username');
    res.status(200).json({ message: 'Daftar peminjaman berhasil diambil', peminjaman });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil daftar peminjaman: ' + error.message });
  }
};

module.exports.getPeminjamanByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const peminjaman = await PeminjamanModel.find({ id_user: userId });
    if (!peminjaman) {
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }
    res.status(200).json({ message: 'Peminjaman berhasil diambil', peminjaman });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil peminjaman: ' + error.message });
  }
};



module.exports.acceptPeminjaman = (req, res) => {
  const peminjamanId = req.params.id;
  
  PeminjamanModel.findById(peminjamanId)
    .then((peminjaman) => {
      if (!peminjaman) {
        return res.status(404).json({
          error: {
            message: "Peminjaman not found",
          },
        });
      }

      if (peminjaman.status !== "Pending") {
        return res.status(400).json({
          error: {
            message: "Peminjaman is not pending",
          },
        });
      }

      peminjaman.status = "Accepted";

      peminjaman.save()
        .then(() => {
          AsetModel.findById(peminjaman.id_aset)
            .then((asset) => {
              asset.is_borrowed = true;
              asset.save()
                .then(() => {
                  res.status(200).json({
                    message: "Peminjaman accepted successfully",
                    data: {
                      peminjaman,
                      asset: {
                        tag_number: asset.tag_number,
                      },
                    },
                  });
                })
                .catch((assetErr) => {
                  res.status(500).json({
                    error: {
                      message: "Error updating asset status",
                      details: assetErr.message,
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
        .catch((peminjamanErr) => {
          res.status(500).json({
            error: {
              message: "Error accepting peminjaman",
              details: peminjamanErr.message,
            },
          });
        });
    })
    .catch((peminjamanErr) => {
      res.status(500).json({
        error: {
          message: "Error finding peminjaman",
          details: peminjamanErr.message,
        },
      });
    });
};

module.exports.rejectPeminjaman = (req, res) => {
  const peminjamanId = req.params.id;
  
  PeminjamanModel.findById(peminjamanId)
    .then((peminjaman) => {
      if (!peminjaman) {
        return res.status(404).json({
          error: {
            message: "Peminjaman not found",
          },
        });
      }

      if (peminjaman.status !== "Pending") {
        return res.status(400).json({
          error: {
            message: "Peminjaman is not pending",
          },
        });
      }

      peminjaman.status = "Rejected";

      peminjaman.save()
        .then(() => {
          AsetModel.findById(peminjaman.id_aset)
            .then((asset) => {
              asset.is_borrowed = false;
              asset.save()
                .then(() => {
                  res.status(200).json({
                    message: "Peminjaman rejected successfully",
                    data: {
                      peminjaman,
                      asset: {
                        tag_number: asset.tag_number,
                      },
                    },
                  });
                })
                .catch((assetErr) => {
                  res.status(500).json({
                    error: {
                      message: "Error updating asset status",
                      details: assetErr.message,
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
        .catch((peminjamanErr) => {
          res.status(500).json({
            error: {
              message: "Error rejecting peminjaman",
              details: peminjamanErr.message,
            },
          });
        });
    })
    .catch((peminjamanErr) => {
      res.status(500).json({
        error: {
          message: "Error finding peminjaman",
          details: peminjamanErr.message,
        },
      });
    });
};

