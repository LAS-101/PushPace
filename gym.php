<?php
// gym.php - Page Musculation
require_once 'auth.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$userId = $_SESSION['user_id'];

// Ajout d'une séance (INSERT avec requête préparée)
if (isset($_POST['btn_add_gym'])) {
    $requete = $db->prepare('INSERT INTO gym_workouts (user_id, date, duration, calories) VALUES (:user_id, :date, :duration, :calories)');
    $requete->execute(array(
        'user_id' => $userId,
        'date' => $_POST['date'],
        'duration' => $_POST['duration'],
        'calories' => $_POST['calories']
    ));
    header('Location: gym.php');
    exit();
}

// Suppression (DELETE avec requête préparée)
if (isset($_GET['supprimer'])) {
    $requete = $db->prepare('DELETE FROM gym_workouts WHERE id = :id AND user_id = :user_id');
    $requete->execute(array('id' => $_GET['supprimer'], 'user_id' => $userId));
    header('Location: gym.php');
    exit();
}

// Lecture des données (SELECT + while + fetch)
$reponse = $db->query('SELECT * FROM gym_workouts WHERE user_id = ' . $userId . ' ORDER BY date DESC');

include 'header.php';
?>

<main>
    <div class="page-header">
        <div class="page-title-group">
            <div class="page-title-row">Gym</div>
            <p class="page-sub">Suivez vos séances de musculation</p>
        </div>
        <button class="btn btn-orange" id="open-modal">+ Ajouter</button>
    </div>

    <h2>Séances récentes</h2>

    <div class="workout-list">
        <?php
        $i = 0;
        while ($entree = $reponse->fetch()) {
            $i++;
        ?>
            <div class="workout-card">
                <div class="workout-meta">
                    <div class="meta-field">
                        <div class="field-label">Date</div>
                        <div class="field-value"><?php echo $entree['date']; ?></div>
                    </div>
                    <div class="meta-field">
                        <div class="field-label">Durée</div>
                        <div class="field-value"><?php echo $entree['duration']; ?> min</div>
                    </div>
                    <div class="meta-field">
                        <div class="field-label">Calories</div>
                        <div class="field-value"><?php echo $entree['calories']; ?> kcal</div>
                    </div>
                    <div class="meta-field">
                        <a href="gym.php?supprimer=<?php echo $entree['id']; ?>" onclick="return confirm('Supprimer ?')" style="color:red;">Supprimer</a>
                    </div>
                </div>
            </div>
        <?php
        }
        $reponse->closeCursor();
        ?>

        <?php if ($i == 0): ?>
            <p style="color: var(--muted); text-align: center; padding: 40px;">Aucune séance enregistrée.</p>
        <?php endif; ?>
    </div>
</main>

<!-- Formulaire d'ajout -->
<div id="modal-gym" class="modal-overlay" style="display:none;">
    <div class="modal">
        <div class="modal-header">
            <h3>Ajouter une séance</h3>
            <button class="modal-close" id="close-modal">&times;</button>
        </div>
        <form method="POST" action="gym.php" class="modal-form">
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
                    <label>Calories (kcal)</label>
                    <input type="number" name="calories" required>
                </div>
            </div>
            <button type="submit" name="btn_add_gym" class="modal-submit">Enregistrer</button>
        </form>
    </div>
</div>

<script>
    var modal = document.getElementById('modal-gym');
    document.getElementById('open-modal').onclick = function() { modal.style.display = 'flex'; modal.classList.add('active'); };
    document.getElementById('close-modal').onclick = function() { modal.style.display = 'none'; };
</script>
<script src="script.js"></script>
</body>
</html>
