<?php
// db_config.php - Connexion à la base de données avec PDO (comme vu en cours)

try
{
    $db = new PDO('mysql:host=localhost;dbname=pushpace;charset=utf8', 'root', '',
    array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
}
catch (Exception $e)
{
    die('Erreur : ' . $e->getMessage());
}
?>
