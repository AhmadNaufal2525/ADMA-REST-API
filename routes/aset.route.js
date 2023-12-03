const express = require('express');
const { getAllAset, getAssetByTagNumber, addNewAset } = require('../controller/aset.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/aset', authenticate, getAllAset);
router.get('/aset/tagNumber/:tag_number', authenticate, getAssetByTagNumber);
router.post('/addAset', addNewAset);

module.exports = router;