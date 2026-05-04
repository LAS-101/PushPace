<?php
// header.php - En-tête simplifié
$currentPage = basename($_SERVER['PHP_SELF'], ".php");
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PushPace – <?php echo ucfirst($currentPage); ?></title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body class="page-<?php echo $currentPage; ?>">

  <header>
    <a class="logo" href="index.php">
      <svg viewBox="0 0 28 28" fill="none">
        <polyline points="2,18 8,10 13,16 18,6 22,12 26,8" stroke="#00c8ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      PushPace
    </a>
    <div style="flex: 1;"></div>
    <span style="color: var(--muted); font-size: 0.85rem;">Mode Connexion Simple</span>
  </header>

  <nav>
    <div class="nav-tabs">
      <a href="dashboard.php" class="<?php echo $currentPage == 'dashboard' ? 'active' : ''; ?>">Dashboard</a>
      <a href="walking.php" class="<?php echo $currentPage == 'walking' ? 'active' : ''; ?>">Marche</a>
      <a href="gym.php" class="<?php echo $currentPage == 'gym' ? 'active' : ''; ?>">Musculation</a>
      <a href="running.php" class="<?php echo $currentPage == 'running' ? 'active' : ''; ?>">Course</a>
    </div>
  </nav>
