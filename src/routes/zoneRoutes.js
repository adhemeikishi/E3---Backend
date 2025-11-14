const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');

// Routes pour les zones (liées aux dépôts)
router.get('/:id/zones', zoneController.getZonesByDepot);
router.post('/:id/zones', zoneController.createZones);
router.put('/:id/zones', zoneController.updateZones);
router.delete('/:id/zones', zoneController.deleteZones);

module.exports = router;