const express = require('express');
const { getAllAset, getAssetByTagNumber, addNewAset, getAssetById, updateAssetById, deleteAssetById, addNewAsetFromCSV } = require('../controller/aset.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/aset', authenticate, getAllAset);
router.get('/aset/tagNumber/:tag_number', authenticate, getAssetByTagNumber);
router.get('/aset/:id', authenticate, getAssetById);
router.post('/addAset', addNewAset);
router.put('/updateAset/:id', updateAssetById);
router.delete('/deleteAset/:id', deleteAssetById);
router.post('/aset/upload-csv', addNewAsetFromCSV);

module.exports = router;