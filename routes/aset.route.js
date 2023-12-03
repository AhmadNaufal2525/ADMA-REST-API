const express = require('express');
const { getAllAset, getAssetByTagNumber, addNewAset } = require('../controller/aset.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/aset', getAllAset, authenticate);
router.get('/aset/tagNumber/:tag_number', getAssetByTagNumber, authenticate);
router.post('/addAset', addNewAset);

module.exports = router;