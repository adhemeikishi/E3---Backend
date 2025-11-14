const pool = require('../config/postgres');

// Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, d.nom as depot_nom 
      FROM produits p 
      LEFT JOIN depots d ON p.depot_id = d.id 
      ORDER BY p.id
    `);
    
    res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAllProduits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des produits'
    });
  }
};

// Récupérer un produit par ID
exports.getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, d.nom as depot_nom 
      FROM produits p 
      LEFT JOIN depots d ON p.depot_id = d.id 
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getProduitById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du produit'
    });
  }
};

// Créer un produit
exports.createProduit = async (req, res) => {
  try {
    const { nom, code, quantite, depot_id } = req.body;
    
    // Validation
    if (!nom || !code || !depot_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Nom, code et depot_id sont requis'
      });
    }
    
    if (quantite && quantite < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La quantité ne peut pas être négative'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO produits (nom, code, quantite, depot_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, code, quantite || 0, depot_id]
    );
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createProduit:', error);
    
    // Gestion des erreurs spécifiques
    if (error.code === '23505') { // Code unique violation
      return res.status(400).json({
        status: 'error',
        message: 'Ce code produit existe déjà'
      });
    }
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        status: 'error',
        message: 'Le dépôt spécifié n\'existe pas'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création du produit'
    });
  }
};

// Mettre à jour un produit
exports.updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, code, quantite, depot_id } = req.body;
    
    // Validation
    if (quantite && quantite < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La quantité ne peut pas être négative'
      });
    }
    
    const result = await pool.query(
      'UPDATE produits SET nom = $1, code = $2, quantite = $3, depot_id = $4 WHERE id = $5 RETURNING *',
      [nom, code, quantite, depot_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateProduit:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: 'Ce code produit existe déjà'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du produit'
    });
  }
};

// Supprimer un produit
exports.deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM produits WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteProduit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression du produit'
    });
  }
};