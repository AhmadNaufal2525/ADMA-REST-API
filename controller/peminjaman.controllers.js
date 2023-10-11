const PeminjamanModel = require('../models/peminjaman.model');

module.exports.createPeminjaman = async (req, res) => {
   try {
     const peminjamanData = req.body;
     const peminjaman = await PeminjamanModel.create(peminjamanData);
     const asetId = peminjamanData.id_aset;
     const updatedAset = await AsetModel.findByIdAndUpdate(asetId, { is_borrowed: true }, { new: true });
 
     if (!updatedAset) {
       return res.status(404).json({ error: 'Aset tidak ditemukan' });
     }

     const user = await UserModel.findById(peminjamanData.id_user);
     
     res.status(201).json({
       success: 'Peminjaman berhasil dibuat',
       peminjaman,
       updatedAset,
       username: user ? user.username : 'User not found',
     });
   } catch (error) {
     res.status(500).json({ error: 'Gagal membuat peminjaman: ' + error.message });
   }
 };
 

module.exports.getAllPeminjaman = async (req, res) => {
  try {
    const peminjaman = await PeminjamanModel.find();
    res.status(200).json({ message: 'Daftar peminjaman berhasil diambil', peminjaman });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil daftar peminjaman: ' + error.message });
  }
};

module.exports.getPeminjamanById = async (req, res) => {
  try {
    const peminjamanId = req.params.id;
    const peminjaman = await PeminjamanModel.findById(peminjamanId);
    if (!peminjaman) {
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }
    res.status(200).json({ message: 'Peminjaman berhasil diambil', peminjaman });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil peminjaman: ' + error.message });
  }
};
