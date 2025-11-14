# MediTrack Core - API de Gestion de Dépôts Hospitaliers

## Description

MediTrack Core est une API REST pour gérer les stocks de médicaments et consommables dans des dépôts hospitaliers. L'application utilise PostgreSQL pour les données transactionnelles et MongoDB pour la cartographie des zones de stockage.

## Technologies

- Node.js
- Express.js
- PostgreSQL (données structurées)
- MongoDB (cartographie flexible)

## Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configuration des bases de données

#### PostgreSQL

Connectez-vous à PostgreSQL et exécutez :
```sql
CREATE DATABASE meditrack;
\c meditrack

CREATE TABLE depots (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  adresse TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produits (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  quantite INTEGER DEFAULT 0 CHECK (quantite >= 0),
  depot_id INTEGER REFERENCES depots(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mouvements (
  id SERIAL PRIMARY KEY,
  type VARCHAR(3) CHECK (type IN ('IN', 'OUT')) NOT NULL,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  produit_id INTEGER REFERENCES produits(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### MongoDB

MongoDB créera automatiquement la base de données et la collection lors de la première utilisation.

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine :
```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe
PG_DATABASE=meditrack

MONGO_URI=mongodb://localhost:27017/meditrack

PORT=3000
NODE_ENV=development
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Endpoints de l'API

### Dépôts

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /depots | Liste tous les dépôts |
| GET | /depots/:id | Récupère un dépôt |
| POST | /depots | Crée un dépôt |
| PUT | /depots/:id | Met à jour un dépôt |
| DELETE | /depots/:id | Supprime un dépôt |

### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /produits | Liste tous les produits |
| GET | /produits/:id | Récupère un produit |
| POST | /produits | Crée un produit |
| PUT | /produits/:id | Met à jour un produit |
| DELETE | /produits/:id | Supprime un produit |

### Mouvements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /mouvements | Liste tous les mouvements |
| POST | /mouvements | Enregistre un mouvement (IN/OUT) |
| GET | /mouvements/produit/:produit_id | Mouvements d'un produit |

### Zones (MongoDB)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /depots/:id/zones | Récupère la structure d'un dépôt |
| POST | /depots/:id/zones | Crée la structure d'un dépôt |
| PUT | /depots/:id/zones | Met à jour la structure |
| DELETE | /depots/:id/zones | Supprime la structure |

## Exemples de requêtes

### Créer un dépôt
```bash
curl -X POST http://localhost:3000/depots \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dépôt Central Paris",
    "adresse": "123 Rue de la Santé, 75014 Paris"
  }'
```

### Créer un produit
```bash
curl -X POST http://localhost:3000/produits \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Paracétamol 500mg",
    "code": "PARA-500",
    "quantite": 1000,
    "depot_id": 1
  }'
```

### Enregistrer un mouvement d'entrée
```bash
curl -X POST http://localhost:3000/mouvements \
  -H "Content-Type: application/json" \
  -d '{
    "type": "IN",
    "quantite": 500,
    "produit_id": 1
  }'
```

### Créer la structure de zones
```bash
curl -X POST http://localhost:3000/depots/1/zones \
  -H "Content-Type: application/json" \
  -d '{
    "zones": [
      {
        "nom": "Zone A",
        "description": "Zone réfrigérée",
        "bacs": [
          {
            "nom": "Bac A1",
            "capacite": 100,
            "produits": []
          }
        ]
      }
    ]
  }'
```

## Structure du projet
```
meditrack-core/
├── src/
│   ├── config/
│   │   ├── postgres.js
│   │   └── mongodb.js
│   ├── models/
│   │   └── Zone.js
│   ├── controllers/
│   │   ├── depotController.js
│   │   ├── produitController.js
│   │   ├── mouvementController.js
│   │   └── zoneController.js
│   ├── routes/
│   │   ├── depotRoutes.js
│   │   ├── produitRoutes.js
│   │   ├── mouvementRoutes.js
│   │   └── zoneRoutes.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Architecture MVC

- **Models** : Définition des structures de données (MongoDB)
- **Controllers** : Logique métier et traitement des requêtes
- **Routes** : Définition des endpoints et liaison avec les contrôleurs
- **Config** : Configuration des connexions aux bases de données

## Gestion des erreurs

L'API retourne des réponses JSON structurées :
```json
{
  "status": "success",
  "data": { ... }
}
```

En cas d'erreur :
```json
{
  "status": "error",
  "message": "Description de l'erreur"
}
```

## Sécurité

- Requêtes paramétrées pour PostgreSQL (protection injection SQL)
- Validation des entrées utilisateur
- Gestion des erreurs sans exposition d'informations sensibles

## Auteur

Projet développé dans le cadre de l'épreuve E3 - Conception et développement Back-end
