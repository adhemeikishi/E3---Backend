const express = require('express');
const router = express.Router();
const mouvementController = require('../controllers/mouvementController');

router.get('/', mouvementController.getAllMouvements);
router.post('/', mouvementController.createMouvement);
router.get('/produit/:produit_id', mouvementController.getMouvementsByProduit);

module.exports = router;