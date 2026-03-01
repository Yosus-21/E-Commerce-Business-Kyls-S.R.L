const express = require('express');
const router = express.Router();
const { getActivePartners, getAllPartners, createPartner, updatePartner, deletePartner } = require('../controllers/partnerController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadPartnerLogo, handleMulterError, addNormalizedUrl } = require('../middlewares/uploadImages');

router.get('/', getActivePartners);
router.get('/all', protect, authorize('admin'), getAllPartners);

router.post('/', protect, authorize('admin'), uploadPartnerLogo, handleMulterError, addNormalizedUrl, createPartner);
router.put('/:id', protect, authorize('admin'), uploadPartnerLogo, handleMulterError, addNormalizedUrl, updatePartner);
router.delete('/:id', protect, authorize('admin'), deletePartner);

module.exports = router;
