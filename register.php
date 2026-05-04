<?php
// register.php - Inscription
require_once 'auth.php';

if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

$message = '';

// Traitement du formulaire d'inscription
if (isset($_POST['btn_register'])) {
    // On utilise une requête préparée pour insérer le nouvel utilisateur (comme vu en cours)
    $requete = $db->prepare('INSERT INTO users (username, password) VALUES (:username, :password)');
    $requete->execute(array(
        'username' => $_POST['username'],
        'password' => $_POST['password']
    ));

    $message = 'Compte créé avec succès ! <a href="login.php">Connectez-vous ici</a>';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>PushPace - Inscription</title>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="page-auth">
    <div class="auth-container">
        <h1 class="auth-title">Inscription</h1>

        <?php
        if ($message != '') {
            echo '<p style="color: green; text-align: center;">' . $message . '</p>';
        }
        ?>

        <form class="auth-form" method="POST" action="register.php">
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" name="btn_register" class="auth-btn">Créer mon compte</button>
        </form>

        <p class="auth-footer">Déjà un compte ? <a href="login.php">Se connecter</a></p>
    </div>
</body>
</html>
