const PeminjamanModel = require("../models/peminjaman.model");
const AsetModel = require("../models/aset.model");
const UserModel = require("../models/users.model");
const AdminModel = require("../models/admin.model");

module.exports.createPeminjaman = (req, res) => {
  const {
    lokasi,
    kondisi_aset,
    tanggal_peminjaman,
    tujuan_peminjaman,
    tagNumber,
    username,
  } = req.body;
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

          newPeminjaman
            .save()
            .then((peminjaman) => {
              asset.is_borrowed = false;
              asset
                .save()
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

module.exports.getPeminjamanById = async (req, res) => {
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

module.exports.getPeminjamanByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const peminjaman = await PeminjamanModel.find({ id_user: userId }).populate(
      "id_aset"
    );

    if (!peminjaman) {
      return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
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

module.exports.approvedPeminjaman = (req, res) => {
  const { peminjamanId, adminId } = req.body;

  PeminjamanModel.findById(peminjamanId)
    .then((peminjaman) => {
      if (!peminjaman) {
        return res.status(404).json({
          error: {
            message: "Peminjaman not found",
          },
        });
      }

      if (peminjaman.status === "Approved") {
        return res.status(400).json({
          error: {
            message: "Peminjaman is already approved",
          },
        });
      }

      peminjaman.admin_id = adminId;
      peminjaman
        .save()
        .then(() => {
          peminjaman.status = "Approved";
          AdminModel.findById(adminId)
            .then((admin) => {
              if (!admin) {
                return res.status(404).json({
                  error: {
                    message: "Admin not found",
                  },
                });
              }

              AsetModel.findById(peminjaman.id_aset)
                .then((asset) => {
                  if (!asset) {
                    return res.status(404).json({
                      error: {
                        message: "Asset not found",
                      },
                    });
                  }
                  asset.is_borrowed = true;
                  asset
                    .save()
                    .then(() => {
                      UserModel.findById(peminjaman.id_user)
                        .then((user) => {
                          if (!user) {
                            return res.status(404).json({
                              error: {
                                message: "User not found",
                              },
                            });
                          }

                          res.status(200).json({
                            message: "Peminjaman berhasil disetujui",
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
                              admin: {
                                admin_id: admin._id,
                                username: admin.username,
                              },
                            },
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
            .catch((adminErr) => {
              res.status(500).json({
                error: {
                  message: "Error finding admin",
                  details: adminErr.message,
                },
              });
            });
        })
        .catch((peminjamanErr) => {
          res.status(500).json({
            error: {
              message: "Error updating peminjaman status",
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
