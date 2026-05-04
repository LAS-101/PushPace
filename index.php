<?php
// index.php - Page d'accueil simplifiée avec connexion base de données
require_once 'db_config.php';

// Exemple de requête simple pour vérifier la connexion
$reponse = $db->query('SELECT COUNT(*) as total FROM walking_activities');
$donnees = $reponse->fetch();
$nbMarches = $donnees['total'];
$reponse->closeCursor();

include 'header.php';
?>

<main>
    <h1 class="page-title">Bienvenue sur PushPace</h1>
    <p class="page-sub">Le PHP est maintenant connecté à la base de données MySQL.</p>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="label">Connexion Réussie</div>
            <div class="value">OK</div>
            <div class="sub">Base de données active</div>
        </div>
        <div class="stat-card">
            <div class="label">Activités trouvées</div>
            <div class="value"><?php echo $nbMarches; ?></div>
            <div class="sub">marches en base</div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <p>Cliquez sur les menus ci-dessus pour voir les données récupérées de la base de données.</p>
    </div>
</main>

<script src="script.js"></script>
</body>
</html>
