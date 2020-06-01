# BabyFoot Manager
[EN](readme.md)/FR

Toujours savoir à qui le tour avec BabyFoot Manager!

Version stable [v2](https://github.com/hercemer42/baby-foot-manager/tree/2)

## Fonctionalités

* Créer des nouvelles parties
* Suivre a qui le tour
* Afficher l'historique des parties
* Mettre à jour l'historique des parties en temps réel
* Service de chat en temps réel
* Fonctionne sur des appareils mobile ou dans le navigateur

## Instructions 

### Ajout d'un nouveau jeu
Le but du BabyFoot Manager est de suivre à qui le tour à une table de BabyFoot commune.
Pour commencer, entrer les noms des joueurs qui joueront le prochain jeu et cliques sur «Nouveau jeu».
Le nouveau jeu apparaîtra dans la liste.
Les jeux actives les plus anciens apparaîtront toujours en haut de la liste, pour respecter l'ordre des tours.
Si un ou plusieurs joueurs correspondant au texte que tu saisis existent déjà, il apparaîtra dans la liste déroulante sous la zone de saisie.
Tu peut sélectionnes un joueur existant en utilisant les flèches clavier et le touche d'entrée, ou en cliquant dessus.
Tu peut voir une liste de tous les joueurs existants en tappant un espace.

### Terminer un jeu
Quand une partie est terminée, enregistres un score en cliquant successivement sur chacune des cases de score à côté du nom du jeu et taper le score.
La zone de score prend également en charge les touches fléchées haut et bas et les touches plus et moins.
Le score sera enregistré tant que le jeu est enregistré comme terminé.
Coches ensuite la case verte à côté du nom du jeu pour le marquer comme terminé. Tu peux également terminer une partie sans enregistrer de score.

Le jeu ne peut pas être modifié une fois terminé.
Quand un jeu est terminé, il passera à la partie bas de la liste après une brève pause. Les jeux inachevés sont classés par le plus récent terminé en premier.

### Supprimer un jeu
Si te ne veux plus qu'un jeu apparaisse dans l'historique, tu peut le supprimer. Cliques simplement sur la croix rouge à droite du jeu dans la liste.
Une fois qu'un jeu a été supprimé, il ne sera pas pris en compte dans le classement.

### Le Tchat
Pour commencer, saisis ton nom dans la case 'nickname'.
Si un ou plusieurs joueurs correspondant au texte que tu saisis existent déjà, il apparaîtra dans la liste déroulante sous la zone de saisie.
Tu peux sélectionner un joueur existant en utilisant la flèches clavier et le touche d'entrée, ou en cliquant dessus.
Tu peux voir une liste de tous les joueurs existants en tappant un espace.

Une fois que tu as tapé ton nom, appuies sur entrée pour passer à la boîte de message où tu peux envoyer un message aux autres joueurs.
Tu peut également envoyer un message de manière anonyme.

### Classement
Le classement montre qui a gagné les plus des jeux. Les joueurs sont répertoriés par rang, nom de joueur et nombre total de parties gagnées.  Le classement sera automatiquement mis à jour pendant que tu joues. Les trois meilleurs joueurs sont marqués en or, argent et bronze, et les joueurs peuvent être à égalité pour la place.

## Installation

### Prérequis

  - Node 12.16
  - PostgreSQL 9.6 ( D'autres versions peuvent fonctionner, non testées )
  - Linux ou OSX  (Actuellement, les tests OSX étaient exécutés avec Travis uniquement)
  
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