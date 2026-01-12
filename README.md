Projet Vélib - Test Technique

Application de visualisation et d'administration des stations Vélib parisiennes sur carte interactive.
Fonctionnalités

    Carte interactive : Affichage des stations via Mapbox GL.

    Gestion (CRUD) : Modification, création et suppression des bornes via API.

    Données : Script d'importation (CSV vers SQLite) et persistance.

    Sécurité : Accès protégé par authentification (JWT).

Stack Technique

    Backend : Python (Flask), SQLAlchemy, SQLite.

    Frontend : React.js, Mapbox GL, Axios.

Structure du projet

velib-project/
├── backend/
│   ├── app.py              # Application Flask
│   ├── models.py           # Modèles BDD
│   ├── routes.py           # API Endpoints
│   ├── import_data.py      # Script d'import CSV
│   └── velib-pos (1).csv   # Source de données
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React (Map, Login...)
│   │   └── services/       # Appels API
│   └── package.json
└── README.md

Installation et Lancement
1. Backend

Prérequis : Python 3.8+
Bash

cd backend

# Installation
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Remplir la variable MAPBOX_TOKEN dans le .env pour la recherche d'adresse

# Initialisation BDD
python import_data.py

# Démarrage (port 5001)
python run.py

2. Frontend

Prérequis : Node.js 16+
Bash

cd frontend

# Installation
npm install

# Configuration
# Créer un fichier .env à la racine du frontend avec votre token :
# REACT_APP_MAPBOX_TOKEN=votre_token_mapbox
# REACT_APP_API_URL=http://localhost:5001/api

# Démarrage (port 3000)
npm start

Authentification

Identifiants pour accéder à l'interface :

    User : admin

    Pass : admin

API Endpoints

Le backend expose les routes suivantes (préfixe /api) :

    POST /login : Récupération du token JWT.

    GET /stations : Liste des stations (filtre géo possible).

    POST /stations : Création.

    PUT /stations/<id> : Modification.

    DELETE /stations/<id> : Suppression.