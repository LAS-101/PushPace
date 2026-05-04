<?php
// gym.php - Page Musculation simplifiée
require_once 'db_config.php';

// Lecture des donnees (SELECT + while + fetch)
$reponse = $db->query('SELECT * FROM gym_workouts ORDER BY date DESC');

include 'header.php';
?>

<main>
    <div class="page-header">
        <div class="page-title-group">
            <div class="page-title-row">Gym</div>
            <p class="page-sub">Suivez vos seances de musculation</p>
        </div>
        <button class="btn btn-orange" id="open-modal">+ Ajouter</button>
    </div>

    <h2>Seances recentes</h2>

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
                        <div class="field-label">Duree</div>
                        <div class="field-value"><?php echo $entree['duration']; ?> min</div>
                    </div>
                    <div class="meta-field">
                        <div class="field-label">Calories</div>
                        <div class="field-value"><?php echo $entree['calories']; ?> kcal</div>
                    </div>
                </div>

                <?php
                $reponse_exercices = $db->query('SELECT * FROM gym_exercises WHERE workout_id = ' . $entree['id']);
                $nombreExercices = 0;
                ?>
                <div class="exercises-label">Exercices :</div>
                <div class="exercises-grid">
                    <?php
                    while ($exercice = $reponse_exercices->fetch()) {
                        $nombreExercices++;
                    ?>
                        <div class="exercise-card">
                            <div class="exercise-name"><?php echo $exercice['name']; ?></div>
                            <div class="exercise-detail"><?php echo $exercice['sets']; ?> x <?php echo $exercice['reps']; ?> @ <?php echo $exercice['weight']; ?> kg</div>
                        </div>
                    <?php
                    }
                    $reponse_exercices->closeCursor();
                    ?>

                    <?php if ($nombreExercices == 0): ?>
                        <p style="color: var(--muted);">Aucun exercice enregistre.</p>
                    <?php endif; ?>
                </div>
            </div>
        <?php
        }
        $reponse->closeCursor();
        ?>

        <?php if ($i == 0): ?>
            <p style="color: var(--muted); text-align: center; padding: 40px;">Aucune seance enregistree.</p>
        <?php endif; ?>
    </div>
</main>

<!-- Formulaire d'ajout (Visuel uniquement) -->
<div id="modal-gym" class="modal-overlay" style="display:none;">
    <div class="modal">
        <div class="modal-header">
            <h3>Ajouter une seance</h3>
            <button class="modal-close" id="close-modal">&times;</button>
        </div>
        <form class="modal-form">
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duree (min)</label>
                    <input type="number" name="duration" required>
                </div>
                <div class="form-group">
                    <label>Calories (kcal)</label>
                    <input type="number" name="calories" required>
                </div>
            </div>
            <h4>Exercice</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" name="exercise_name" required>
                </div>
                <div class="form-group">
                    <label>Poids (kg)</label>
                    <input type="number" step="0.1" name="weight" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Series</label>
                    <input type="number" name="sets" required>
                </div>
                <div class="form-group">
                    <label>Repetitions</label>
                    <input type="number" name="reps" required>
                </div>
            </div>
            <button type="button" class="modal-submit" onclick="alert('L\'ajout sera implémenté plus tard.')">Enregistrer</button>
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

