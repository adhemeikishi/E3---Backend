const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importation des configurations
const pool = require('./config/postgres');
const connectMongoDB = require('./config/mongodb');

// Importation des routes
const depotRoutes = require('./routes/depotRoutes');
const produitRoutes = require('./routes/produitRoutes');
const mouvementRoutes = require('./routes/mouvementRoutes');
const zoneRoutes = require('./routes/zoneRoutes');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur MediTrack Core API',
    version: '1.0.0',
    endpoints: {
      depots: '/depots',
      produits: '/produits',
      mouvements: '/mouvements',
      zones: '/depots/:id/zones'
    }
  });
});

// Routes API
app.use('/depots', depotRoutes);
app.use('/depots', zoneRoutes);
app.use('/produits', produitRoutes);
app.use('/mouvements', mouvementRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion PostgreSQL
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connecté');
    
    // Connexion à MongoDB
    await connectMongoDB();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Environnement: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Erreur de démarrage:', error);
    process.exit(1);
  }
};

startServer();