<?php
// dashboard.php - Tableau de bord
require_once 'auth.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$userId = $_SESSION['user_id'];

// On récupère les statistiques de chaque activité avec des requêtes SELECT
$reponse_walk = $db->query('SELECT * FROM walking_activities WHERE user_id = ' . $userId);
$totalWalk = 0;
$calWalk = 0;
$distWalk = 0;
$durWalk = 0;
while ($entree = $reponse_walk->fetch()) {
    $totalWalk++;
    $calWalk = $calWalk + $entree['calories'];
    $distWalk = $distWalk + $entree['distance'];
    $durWalk = $durWalk + $entree['duration'];
}
$reponse_walk->closeCursor();

$reponse_run = $db->query('SELECT * FROM running_activities WHERE user_id = ' . $userId);
$totalRun = 0;
$calRun = 0;
$distRun = 0;
$durRun = 0;
while ($entree = $reponse_run->fetch()) {
    $totalRun++;
    $calRun = $calRun + $entree['calories'];
    $distRun = $distRun + $entree['distance'];
    $durRun = $durRun + $entree['duration'];
}
$reponse_run->closeCursor();

$reponse_gym = $db->query('SELECT * FROM gym_workouts WHERE user_id = ' . $userId);
$totalGym = 0;
$calGym = 0;
$durGym = 0;
while ($entree = $reponse_gym->fetch()) {
    $totalGym++;
    $calGym = $calGym + $entree['calories'];
    $durGym = $durGym + $entree['duration'];
}
$reponse_gym->closeCursor();

// Calcul des totaux
$totalWorkouts = $totalWalk + $totalRun + $totalGym;
$totalCalories = $calWalk + $calRun + $calGym;
$totalDistance = $distWalk + $distRun;
$totalHeures = round(($durWalk + $durRun + $durGym) / 60, 1);

include 'header.php';
?>

<main>
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Bienvenue, <?php echo $_SESSION['username']; ?> !</p>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="label">Total Entraînements</div>
            <div class="value"><?php echo $totalWorkouts; ?></div>
            <div class="sub">sessions</div>
        </div>
        <div class="stat-card">
            <div class="label">Calories Brûlées</div>
            <div class="value"><?php echo $totalCalories; ?></div>
            <div class="sub">kcal total</div>
        </div>
        <div class="stat-card">
            <div class="label">Temps Actif</div>
            <div class="value"><?php echo $totalHeures; ?></div>
            <div class="sub">heures total</div>
        </div>
        <div class="stat-card">
            <div class="label">Distance</div>
            <div class="value"><?php echo $totalDistance; ?></div>
            <div class="sub">km total</div>
        </div>
    </div>

    <div class="activity-grid">
        <div class="act-card walking">
            <div class="act-title">Walking</div>
            <div class="act-row"><span class="lbl">Sessions:</span><span class="val"><?php echo $totalWalk; ?></span></div>
            <div class="act-row"><span class="lbl">Distance:</span><span class="val"><?php echo $distWalk; ?> km</span></div>
            <div class="act-row"><span class="lbl">Calories:</span><span class="val"><?php echo $calWalk; ?> kcal</span></div>
        </div>
        <div class="act-card gym">
            <div class="act-title">Gym</div>
            <div class="act-row"><span class="lbl">Sessions:</span><span class="val"><?php echo $totalGym; ?></span></div>
            <div class="act-row"><span class="lbl">Durée:</span><span class="val"><?php echo round($durGym / 60, 1); ?> h</span></div>
            <div class="act-row"><span class="lbl">Calories:</span><span class="val"><?php echo $calGym; ?> kcal</span></div>
        </div>
        <div class="act-card running">
            <div class="act-title">Running</div>
            <div class="act-row"><span class="lbl">Sessions:</span><span class="val"><?php echo $totalRun; ?></span></div>
            <div class="act-row"><span class="lbl">Distance:</span><span class="val"><?php echo $distRun; ?> km</span></div>
            <div class="act-row"><span class="lbl">Calories:</span><span class="val"><?php echo $calRun; ?> kcal</span></div>
        </div>
    </div>
</main>

<script src="script.js"></script>
</body>
</html>
