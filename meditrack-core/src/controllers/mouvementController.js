const pool = require('../config/postgres');

// Récupérer tous les mouvements
exports.getAllMouvements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.nom as produit_nom, p.code as produit_code 
      FROM mouvements m 
      LEFT JOIN produits p ON m.produit_id = p.id 
      ORDER BY m.date DESC
    `);
    
    res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAllMouvements:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des mouvements'
    });
  }
};

// Créer un mouvement (IMPORTANT: met à jour le stock)
exports.createMouvement = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { type, quantite, produit_id } = req.body;
    
    // Validation des entrées
    if (!type || !quantite || !produit_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Type, quantité et produit_id sont requis'
      });
    }
    
    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le type doit être IN ou OUT'
      });
    }
    
    if (quantite <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La quantité doit être positive'
      });
    }
    
    // Démarrer une transaction
    await client.query('BEGIN');
    
    // Vérifier l'existence du produit et récupérer sa quantité actuelle
    const produitResult = await client.query(
      'SELECT id, quantite FROM produits WHERE id = $1 FOR UPDATE',
      [produit_id]
    );
    
    if (produitResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'error',
        message: 'Produit non trouvé'
      });
    }
    
    const produit = produitResult.rows[0];
    let nouvelleQuantite;
    
    // Calculer la nouvelle quantité
    if (type === 'IN') {
      nouvelleQuantite = produit.quantite + quantite;
    } else { // type === 'OUT'
      nouvelleQuantite = produit.quantite - quantite;
      
      // Vérifier qu'on ne passe pas en stock négatif
      if (nouvelleQuantite < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: `Stock insuffisant. Stock actuel: ${produit.quantite}, demandé: ${quantite}`
        });
      }
    }
    
    // Mettre à jour le stock du produit
    await client.query(
      'UPDATE produits SET quantite = $1 WHERE id = $2',
      [nouvelleQuantite, produit_id]
    );
    
    // Enregistrer le mouvement
    const mouvementResult = await client.query(
      'INSERT INTO mouvements (type, quantite, produit_id) VALUES ($1, $2, $3) RETURNING *',
      [type, quantite, produit_id]
    );
    
    // Valider la transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      status: 'success',
      data: {
        mouvement: mouvementResult.rows[0],
        nouvelle_quantite: nouvelleQuantite
      }
    });
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await client.query('ROLLBACK');
    console.error('Erreur createMouvement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création du mouvement'
    });
  } finally {
    // Libérer la connexion
    client.release();
  }
};

// Récupérer les mouvements d'un produit
exports.getMouvementsByProduit = async (req, res) => {
  try {
    const { produit_id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM mouvements WHERE produit_id = $1 ORDER BY date DESC',
      [produit_id]
    );
    
    res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getMouvementsByProduit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des mouvements'
    });
  }
};