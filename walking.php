<?php
// walking.php - Page Marche
require_once 'auth.php';

// Vérification si l'utilisateur est connecté (session)
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$userId = $_SESSION['user_id'];

// Traitement du formulaire d'ajout (INSERT avec requête préparée)
if (isset($_POST['btn_add_walk'])) {
    $requete = $db->prepare('INSERT INTO walking_activities (user_id, date, duration, distance, steps, calories) VALUES (:user_id, :date, :duration, :distance, :steps, :calories)');
    $requete->execute(array(
        'user_id' => $userId,
        'date' => $_POST['date'],
        'duration' => $_POST['duration'],
        'distance' => $_POST['distance'],
        'steps' => $_POST['steps'],
        'calories' => $_POST['calories']
    ));
    header('Location: walking.php');
    exit();
}

// Suppression d'une activité (DELETE avec requête préparée)
if (isset($_GET['supprimer'])) {
    $requete = $db->prepare('DELETE FROM walking_activities WHERE id = :id AND user_id = :user_id');
    $requete->execute(array('id' => $_GET['supprimer'], 'user_id' => $userId));
    header('Location: walking.php');
    exit();
}

// Lecture des données (SELECT avec query + fetch dans une boucle while)
$reponse = $db->query('SELECT * FROM walking_activities WHERE user_id = ' . $userId . ' ORDER BY date DESC');

include 'header.php';
?>

<main>
    <div class="page-header">
        <div class="page-title-group">
            <div class="page-title-row">Walking</div>
            <p class="page-sub">Suivez vos marches et votre progression</p>
        </div>
        <button class="btn btn-green" id="open-modal">+ Ajouter</button>
    </div>

    <h2>Activités récentes</h2>

    <div class="activity-list">
        <?php
        $i = 0;
        while ($entree = $reponse->fetch()) {
            $i++;
        ?>
            <div class="activity-row">
                <div>
                    <div class="field-label">Date</div>
                    <div class="field-value"><?php echo $entree['date']; ?></div>
                </div>
                <div>
                    <div class="field-label">Durée</div>
                    <div class="field-value"><?php echo $entree['duration']; ?> min</div>
                </div>
                <div>
                    <div class="field-label">Distance</div>
                    <div class="field-value"><?php echo $entree['distance']; ?> km</div>
                </div>
                <div>
                    <div class="field-label">Pas</div>
                    <div class="field-value"><?php echo $entree['steps']; ?></div>
                </div>
                <div>
                    <div class="field-label">Calories</div>
                    <div class="field-value"><?php echo $entree['calories']; ?> kcal</div>
                </div>
                <div>
                    <a href="walking.php?supprimer=<?php echo $entree['id']; ?>" onclick="return confirm('Supprimer cette activité ?')" style="color:red;">Supprimer</a>
                </div>
            </div>
        <?php
        }
        $reponse->closeCursor(); // Termine le traitement de la requête
        ?>

        <?php if ($i == 0): ?>
            <p style="color: var(--muted); text-align: center; padding: 40px;">Aucune activité enregistrée.</p>
        <?php endif; ?>
    </div>
</main>

<!-- Formulaire d'ajout -->
<div id="modal-walk" class="modal-overlay" style="display:none;">
    <div class="modal">
        <div class="modal-header">
            <h3>Ajouter une marche</h3>
            <button class="modal-close" id="close-modal">&times;</button>
        </div>
        <form method="POST" action="walking.php" class="modal-form">
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Durée (min)</label>
                    <input type="number" name="duration" required>
                </div>
                <div class="form-group">
                    <label>Distance (km)</label>
                    <input type="number" step="0.1" name="distance" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Pas</label>
                    <input type="number" name="steps" required>
                </div>
                <div class="form-group">
                    <label>Calories (kcal)</label>
                    <input type="number" name="calories" required>
                </div>
            </div>
            <button type="submit" name="btn_add_walk" class="modal-submit">Enregistrer</button>
        </form>
    </div>
</div>

<script>
    var modal = document.getElementById('modal-walk');
    document.getElementById('open-modal').onclick = function() { modal.style.display = 'flex'; modal.classList.add('active'); };
    document.getElementById('close-modal').onclick = function() { modal.style.display = 'none'; };
</script>
<script src="script.js"></script>
</body>
</html>
