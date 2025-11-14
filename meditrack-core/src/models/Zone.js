const mongoose = require('mongoose');

// Schéma pour les bacs de stockage
const BacSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  capacite: {
    type: Number,
    required: true
  },
  produits: [{
    produit_id: Number,
    quantite: Number
  }]
});

// Schéma pour les zones du dépôt
const ZoneSchema = new mongoose.Schema({
  depot_id: {
    type: Number,
    required: true,
    unique: true // Un seul document de zones par dépôt
  },
  zones: [{
    nom: String,
    description: String,
    bacs: [BacSchema]
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour automatique de updated_at
ZoneSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Zone', ZoneSchema);