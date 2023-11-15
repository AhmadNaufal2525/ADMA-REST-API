const PengembalianModel = require('../model/pengembalian.model');
const path = require('path');

const addPengembalian = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "Tidak ada gambar yang diupload" });

    try {
        const { id_user, id_aset, lokasi, kondisi_aset, tanggal_pengembalian, status } = req.body;
        
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Image" });
        if (fileSize > 5000000) return res.status(422).json({ msg: "Ukuran image harus kurang dari 5 MB" });

        file.mv(`./images/aset/${fileName}`, async (err) => {
            if (err) return res.status(500).json({ msg: err.message });

            const pengembalian = new PengembalianModel({
                id_user,
                id_aset,
                lokasi,
                kondisi_aset,
                tanggal_pengembalian,
                foto: fileName,
                url,
                status,
            });

            await pengembalian.save();

            res.status(201).json({ msg: "Data Pengembalian Berhasil Ditambahkan!" });
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

module.exports = { addPengembalian };