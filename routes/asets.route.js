const express = require('express');
const {getAssets, getAssetByName, getAssetByTagNumber, addNewAsset} = require('../controller/aset.controllers')
const router = express.Router();

router.get('/aset', getAssets);
router.get('/aset/:nama_alat', getAssetByName);
router.get('/aset/tagNumber/:tag_number', getAssetByTagNumber);
router.post('/aset', addNewAsset);

module.exports = router;