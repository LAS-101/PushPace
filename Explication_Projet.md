# Documentation du Projet PushPace

Ce document explique les modifications apportées au projet pour passer de localStorage à une base de données MySQL.

## Concepts PHP utilisés (issus du cours)

Tous les concepts utilisés proviennent directement du cours "Accès aux bases de données avec PHP" :

### 1. Connexion à la base de données avec PDO
```php
try {
    $db = new PDO('mysql:host=localhost;dbname=pushpace;charset=utf8', 'root', '',
    array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
}
catch (Exception $e) {
    die('Erreur : ' . $e->getMessage());
}
```

### 2. Lecture de données (SELECT + query + fetch + closeCursor)
```php
$reponse = $db->query('SELECT * FROM walking_activities WHERE user_id = ' . $userId);
while ($entree = $reponse->fetch()) {
    echo $entree['date'];
}
$reponse->closeCursor();
```

### 3. Ajout de données (INSERT avec requête préparée)
```php
$requete = $db->prepare('INSERT INTO walking_activities (user_id, date, duration) VALUES (:user_id, :date, :duration)');
$requete->execute(array(
    'user_id' => $userId,
    'date' => $_POST['date'],
    'duration' => $_POST['duration']
));
```

### 4. Suppression de données (DELETE avec requête préparée)
```php
$requete = $db->prepare('DELETE FROM walking_activities WHERE id = :id AND user_id = :user_id');
$requete->execute(array('id' => $_GET['supprimer'], 'user_id' => $userId));
```

### 5. Sessions (du chapitre Sessions)
```php
session_start();
$_SESSION['user_id'] = $utilisateur['id'];
isset($_SESSION['user_id'])
```

### 6. Formulaires HTML avec method="POST"
Les données sont envoyées via des formulaires classiques et récupérées avec `$_POST['nom_du_champ']`.

## Structure des fichiers
- `db_config.php` : Connexion PDO à la base
- `auth.php` : session_start() + inclusion de la connexion
- `header.php` : En-tête commun (logo + navigation)
- `login.php` : Connexion (SELECT + fetch pour vérifier l'utilisateur)
- `register.php` : Inscription (SELECT pour verifier le nom, puis INSERT avec prepare/execute)
- `dashboard.php` : Statistiques (SELECT + while/fetch + calculs simples)
- `walking.php` : Gestion des marches (SELECT, INSERT, DELETE)
- `running.php` : Gestion des courses (SELECT, INSERT, DELETE)
- `gym.php` : Gestion des seances et des exercices (SELECT, INSERT, DELETE)
- `logout.php` : Destruction de la session
- `database.sql` : Script de création de la base de données

## Installation
1. Importer `database.sql` dans phpMyAdmin
2. Placer le dossier dans `htdocs` de XAMPP
3. Ouvrir `http://localhost/ddddddd/login.php`
