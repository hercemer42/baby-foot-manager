# BabyFoot Manager spec techniques
[EN](spec.md)/FR

## 1  Descriptif
BabyFoot Manager est une 'Rich Web Application' qui permet de créer des tours de BabyFoot de manière collaborative.

## 2  Caractéristiques
Les fonctionnalités sont divisées en trois sprints: V1, V2 et V3. Chaque sprint sera considéré comme une version entièrement fonctionnelle.

### 2.1 V1
Un Baby Foot Manager entièrement fonctionnel avec les fonctionnalités suivantes:

* Afficher une liste des parties en cours, en attente et terminés, et faites une distinction visuelle entre eux.
* Créer, supprimer et terminer une partie.
* Afficher un compteur de parties inachevés.
* Propager des mises à jour de la liste des parties en temps réel aux autres clients.

### 2.2 V2
Ajoute un service de chat en temps réel avec les fonctionnalités suivantes:

* Afficher l'historique du chat.
* Metter à jour le chat en temps réel.
* Permetter aux joueurs de créer son alias en le tapant, avec une 'typeahead' qui recherche automatiquement les entrées existantes.

### 2.2 V3
Ajoute un classement et un système de suivi des scores.

* Enregistrer le score à la fin d'une partie.
* Afficher un classement pour montrer le classement des joueurs par buts marqués et parties gagnés.

## 3  Implémentation technique

### 3.2  Serveur NodeJS
L'architecture du serveur comprendra le processus principal, un connecteur de base de données, un routeur API et une librairie de services. Les librairies de services seront responsables de toute manipulation de données ou d'autres fonctions utilitaires. L'API fournira des données historiques via le protocole HTTP et enverra des messages en direct au client via WebSocket. Le serveur sera écrit en utilisant la norme ES6, et suivra un style de programmation fonctionnel, dans la mesure du possible sans utiliser de bibliothèques externes.

#### 3.2.1  Modules NPM:

* ws
* Node-postgres
* Express

### 3.2.1  OS
* OS developpement : Debian 9 Stretch
* OS test (CI): Ubuntu 16.04 Xenial
* OS test (CI): OSX

#### 3.2.1.1  Dépendances OS
* Node 12.16.3 LTS
* PostgreSQL 9.6

### 3.3  Client
Vanilla Javascript, HTML et CSS utilisant les API natives WebSocket et Date avec les normes ES5 et HTML5, en utilisant un style de programmation fonctionnel. Des scripts utilitaires seront utilisés pour abstraire des tâches répétitives telles que les protocoles de communication. LocalStorage sera utilisé pour mémoriser l'alias du joueur pour le système de chat.

#### 3.3.1  Design
Le design sera minimaliste et réactif, utilisant autant que possible des couleurs et des repères visuels pour communiquer des informations à l'utilisateur et éviter les textes inutiles. L'application évoluera de manière réactive.

#### 3.3.2  Navigateurs pris en charge (pc et mobile)
* Chromium\Chrome
* Firefox
* Safari

### 3.4  Devops

#### 3.4.1  Intégration continue
Jenkins et Github avec pipelines pour le linting et les tests.

#### 3.4.2  Build
Les modules Browser-Sync, gulp-nodemon et Gulp seront utilisés pendant le développement pour actualiser automatiquement l'application lors de la détection des modifications du code source du client. Afin de réduire la complexité du projet et compte tenu de la petite taille de l'application, un 'module bundler' ou un minimiseur ne sera pas utilisé.

#### 3.4.2  Test
Une suite de tests complète ne sera pas tentée. L'accent sera mis sur les éléments susceptibles de casser:

* Test du service de base de données backend et de la cohérence des données API avec Mocha.
* Tests e2e frontend de base à l'aide de Cypress pour assurer le chargement des pages et le rendu des principaux éléments.

#### 3.4.3  Linting
ESLint

#### 3.4.4  Contrôle de source
Git et Github

### 4  Architecture de communication
Les communications seront en temps réel, permettant au client de mettre en place à jour sans actualiser la page.

Lors du chargement de la page client, un appel HTTP sera d'abord effectué pour obtenir les données historiques. Ensuite, une connexion WebSocket sera établie avec le serveur afin que les derniers messages puissent être reçus. Cela profitera des avantages des deux protocoles tout en évitant toute perte de données.

Les données persistantes seront obtenues via la connexion WebSocket. Toutes les données persistantes seront immédiatement transmises à toutes les connexions actives.

### 5  Architecture de base de données

Base de données relationnelle utilisant PostgreSQL avec une structure de données simple à trois tables. Les tables seront créées au démarrage par le serveur NodeJS si elles n'existent pas déjà. La base de données doit être créée avant le démarrage de l'application conformément à la documentation d'installation dans le [readme](readme.md).

#### 5.1  Structure de données:
* players
  * clé primaire:
    - id (integer, séquencé)
  * colonnes:
    - name (text, unique)

* games
  * clé primaire:
    - id (integer, séquencé)
  * colonnes:
    - active (boolean, unique)
    - created_at (timestamp)
    - updated_at (timestamp)
  * clés étrangères: 
    - player1 => players
    - player2 => players
  * les index:
    - active, created_at

* chat
  * clé primaire:
    - id (integer, séquencé)
  * colonnes:
    - message
    - player
    - created_at
  * les index:
    - created_at
