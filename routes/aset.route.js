const express = require('express');
const { getAllAset, getAssetByTagNumber, addNewAset } = require('../controller/aset.controller');

const router = express.Router();

router.get('/aset', getAllAset);
router.get('/aset/tagNumber/:tag_number', getAssetByTagNumber);
router.post('/addAset', addNewAset);

module.exports = router;