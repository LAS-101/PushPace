<?php
// login.php - Page de connexion
require_once 'auth.php';

// Si l'utilisateur est déjà connecté, on le redirige vers le dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

$erreur = '';

// Traitement du formulaire de connexion
if (isset($_POST['btn_login'])) {
    // On utilise une requête préparée avec des marqueurs nominatifs (comme vu en cours)
    $requete = $db->prepare('SELECT * FROM users WHERE username = :username');
    $requete->execute(array('username' => $_POST['username']));
    $utilisateur = $requete->fetch();
    $requete->closeCursor();

    if ($utilisateur && $utilisateur['password'] == $_POST['password']) {
        // On enregistre les infos dans la session (comme vu dans le chapitre Sessions)
        $_SESSION['user_id'] = $utilisateur['id'];
        $_SESSION['username'] = $utilisateur['username'];
        header('Location: dashboard.php');
        exit();
    } else {
        $erreur = 'Nom d\'utilisateur ou mot de passe incorrect !';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>PushPace - Connexion</title>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="page-auth">
    <div class="auth-container">
        <h1 class="auth-title">PushPace</h1>
        <p class="auth-sub">Connectez-vous pour suivre vos progrès.</p>

        <?php
        if ($erreur != '') {
            echo '<p style="color: red; text-align: center;">' . $erreur . '</p>';
        }
        ?>

        <form class="auth-form" method="POST" action="login.php">
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" name="btn_login" class="auth-btn">Se connecter</button>
        </form>

        <p class="auth-footer">Pas de compte ? <a href="register.php">Créer un compte</a></p>
    </div>
</body>
</html>
