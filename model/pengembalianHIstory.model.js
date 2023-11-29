const mongoose = require('mongoose');

const pengembalianHistorySchema = new mongoose.Schema(
  {
    id_pengembalian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pengembalian',
      required: true,
    },
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    id_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['Rejected', 'Approved'],
    },
  },
  { timestamps: true, versionKey: false }
);

const PengembalianHistory = mongoose.model('PengembalianHistory', pengembalianHistorySchema);

module.exports = PengembalianHistory;