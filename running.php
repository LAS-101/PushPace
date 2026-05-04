<?php
// running.php - Page Course à pied simplifiée
require_once 'db_config.php';

// Lecture des données (SELECT + while + fetch)
$reponse = $db->query('SELECT * FROM running_activities ORDER BY date DESC');

include 'header.php';
?>

<main>
    <div class="page-header">
        <div class="page-title-group">
            <div class="page-title-row">Running</div>
            <p class="page-sub">Suivez vos courses et améliorez votre allure</p>
        </div>
        <button class="btn btn-cyan" id="open-modal">+ Ajouter</button>
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
                    <div class="field-label">Allure</div>
                    <div class="field-value"><?php echo $entree['pace']; ?> min/km</div>
                </div>
                <div>
                    <div class="field-label">Calories</div>
                    <div class="field-value"><?php echo $entree['calories']; ?> kcal</div>
                </div>
            </div>
        <?php
        }
        $reponse->closeCursor();
        ?>

        <?php if ($i == 0): ?>
            <p style="color: var(--muted); text-align: center; padding: 40px;">Aucune activité enregistrée.</p>
        <?php endif; ?>
    </div>
</main>

<!-- Formulaire d'ajout (Visuel uniquement) -->
<div id="modal-run" class="modal-overlay" style="display:none;">
    <div class="modal">
        <div class="modal-header">
            <h3>Ajouter une course</h3>
            <button class="modal-close" id="close-modal">&times;</button>
        </div>
        <form class="modal-form">
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
                    <label>Allure (min/km)</label>
                    <input type="number" step="0.1" name="pace" required>
                </div>
                <div class="form-group">
                    <label>Calories (kcal)</label>
                    <input type="number" name="calories" required>
                </div>
            </div>
            <button type="button" class="modal-submit" onclick="alert('L\'ajout sera implémenté plus tard.')">Enregistrer</button>
        </form>
    </div>
</div>

<script>
    var modal = document.getElementById('modal-run');
    document.getElementById('open-modal').onclick = function() { modal.style.display = 'flex'; modal.classList.add('active'); };
    document.getElementById('close-modal').onclick = function() { modal.style.display = 'none'; };
</script>
<script src="script.js"></script>
</body>
</html>

