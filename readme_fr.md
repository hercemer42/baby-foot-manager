# BabyFoot Manager
[EN](readme.md)/FR

Toujours savoir à qui le tour avec BabyFoot Manager!

Version stable [v1](https://github.com/hercemer42/baby-foot-manager/tree/1)

## Fonctionalités

* Créer des nouvelles parties
* Suivre a qui le tour
* Afficher l'historique des parties
* Mettre à jour l'historique des parties en temps réel
* Fonctionne sur des appareils mobile ou dans le navigateur

## Installation

### Prérequis

  - Node 12.16
  - PostgreSQL 9.6
  - Linux ou OSX (actuellement non testé sur OSX)
  
### Configurer la base de données

Il est conseillé de changer le mot de passe par défaut.
Sur un système Linux, il peut être nécessaire de préfixer les commandes avec ```sudo -u postgres```

```
psql -c "CREATE DATABASE babyfoot'
psql -c "CREATE USER tablesoccer WITH ENCRYPTED PASSWORD 'fussball'
psql -c "GRANT ALL PRIVILEGES ON DATABASE babyfoot TO tablesoccer"
```

### Configurer le serveur

```
git clone git@github.com:hercemer42/baby-foot-manager.git
cd baby-foot-manager
npm install
```

### Variables d'environnement facultatives

|                   |                                                           |
|-------------------|:----------------------------------------------------------|
| BF_DBHOST         | le nom d'hôte de la base de données PostgreSQL            |
| BF_PGUSER         | l'utilisateur PostgreSQL pour la base de données babyfoot |
| BF_PGPASSWORD     | le mot de passe utilisateur PostgreSQL                    |
| BF_PGDATABASE     | la base de données PostgreSQL à utiliser pour le projet   |
| BF_PGPORT         | le port PostgreSQL                                        |
| BF_HTTP_PORT      | le port du serveur Web HTTP                               |
| BF_WEBSOCKET_PORT | le port du serveur WebSocket                              |
| BF_EXTERNAL_IP    | l'adresse IP du serveur                                   |
|                   |                                                           |

Ils peuvent être chargés automatiquement au démarrage en les ajoutant à ```~/.profile```

### Démarrer le serveur
```npm start```

### Accéder au client
Ouvres le navigateur et accédes à ```http://%server_ip%:3000``` (Remplacer ```%server_ip%``` avec l'adresse IP du serveur)

## Assistance

Veuillez [ouvrir un 'issue'](https://github.com/hercemer42/baby-foot-manager/issues/new).

## Licence

[MIT](LICENSE.md)