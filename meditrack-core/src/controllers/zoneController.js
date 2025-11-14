const Zone = require('../models/Zone');

// Récupérer les zones d'un dépôt
exports.getZonesByDepot = async (req, res) => {
  try {
    const { id } = req.params;
    const depot_id = parseInt(id);
    
    const zone = await Zone.findOne({ depot_id });
    
    if (!zone) {
      return res.status(404).json({
        status: 'error',
        message: 'Aucune zone trouvée pour ce dépôt'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: zone
    });
  } catch (error) {
    console.error('Erreur getZonesByDepot:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des zones'
    });
  }
};

// Créer la structure des zones pour un dépôt
exports.createZones = async (req, res) => {
  try {
    const { id } = req.params;
    const depot_id = parseInt(id);
    const { zones } = req.body;
    
    // Validation
    if (!zones || !Array.isArray(zones)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le champ zones doit être un tableau'
      });
    }
    
    // Vérifier si des zones existent déjà pour ce dépôt
    const existingZone = await Zone.findOne({ depot_id });
    if (existingZone) {
      return res.status(400).json({
        status: 'error',
        message: 'Des zones existent déjà pour ce dépôt. Utilisez PUT pour mettre à jour.'
      });
    }
    
    // Créer le document zones
    const newZone = new Zone({
      depot_id,
      zones
    });
    
    await newZone.save();
    
    res.status(201).json({
      status: 'success',
      data: newZone
    });
  } catch (error) {
    console.error('Erreur createZones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création des zones'
    });
  }
};

// Mettre à jour les zones d'un dépôt
exports.updateZones = async (req, res) => {
  try {
    const { id } = req.params;
    const depot_id = parseInt(id);
    const { zones } = req.body;
    
    // Validation
    if (!zones || !Array.isArray(zones)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le champ zones doit être un tableau'
      });
    }
    
    // Mettre à jour ou créer si n'existe pas
    const updatedZone = await Zone.findOneAndUpdate(
      { depot_id },
      { zones, updated_at: Date.now() },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedZone
    });
  } catch (error) {
    console.error('Erreur updateZones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour des zones'
    });
  }
};

// Supprimer les zones d'un dépôt
exports.deleteZones = async (req, res) => {
  try {
    const { id } = req.params;
    const depot_id = parseInt(id);
    
    const result = await Zone.findOneAndDelete({ depot_id });
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Aucune zone trouvée pour ce dépôt'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Zones supprimées avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteZones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression des zones'
    });
  }
};