const pool = require('../config/postgres');

// Récupérer tous les dépôts
exports.getAllDepots = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM depots ORDER BY id');
    res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAllDepots:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des dépôts'
    });
  }
};

// Récupérer un dépôt par ID
exports.getDepotById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM depots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Dépôt non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getDepotById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du dépôt'
    });
  }
};

// Créer un dépôt
exports.createDepot = async (req, res) => {
  try {
    const { nom, adresse } = req.body;
    
    // Validation
    if (!nom || !adresse) {
      return res.status(400).json({
        status: 'error',
        message: 'Nom et adresse sont requis'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO depots (nom, adresse) VALUES ($1, $2) RETURNING *',
      [nom, adresse]
    );
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createDepot:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création du dépôt'
    });
  }
};

// Mettre à jour un dépôt
exports.updateDepot = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, adresse } = req.body;
    
    const result = await pool.query(
      'UPDATE depots SET nom = $1, adresse = $2 WHERE id = $3 RETURNING *',
      [nom, adresse, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Dépôt non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateDepot:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du dépôt'
    });
  }
};

// Supprimer un dépôt
exports.deleteDepot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM depots WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Dépôt non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Dépôt supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteDepot:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression du dépôt'
    });
  }
};