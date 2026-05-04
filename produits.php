<?php
// produits.php - CRUD simple des produits sans login/logout
require_once 'db_config.php';

$message = '';
$produitAModifier = null;

// Creation d'un produit (INSERT)
if (isset($_POST['btn_ajouter'])) {
    $requete = $db->prepare('INSERT INTO produits (nom, prix, quantite, description) VALUES (:nom, :prix, :quantite, :description)');
    $requete->execute(array(
        'nom' => $_POST['nom'],
        'prix' => $_POST['prix'],
        'quantite' => $_POST['quantite'],
        'description' => $_POST['description']
    ));

    header('Location: produits.php');
    exit();
}

// Modification d'un produit (UPDATE)
if (isset($_POST['btn_modifier'])) {
    $requete = $db->prepare('UPDATE produits SET nom = :nom, prix = :prix, quantite = :quantite, description = :description WHERE id = :id');
    $requete->execute(array(
        'id' => $_POST['id'],
        'nom' => $_POST['nom'],
        'prix' => $_POST['prix'],
        'quantite' => $_POST['quantite'],
        'description' => $_POST['description']
    ));

    header('Location: produits.php');
    exit();
}

// Suppression d'un produit (DELETE)
if (isset($_GET['supprimer'])) {
    $requete = $db->prepare('DELETE FROM produits WHERE id = :id');
    $requete->execute(array('id' => $_GET['supprimer']));

    header('Location: produits.php');
    exit();
}

// Recuperation du produit a modifier (SELECT + fetch)
if (isset($_GET['modifier'])) {
    $requete = $db->prepare('SELECT * FROM produits WHERE id = :id');
    $requete->execute(array('id' => $_GET['modifier']));
    $produitAModifier = $requete->fetch();
    $requete->closeCursor();
}

// Recuperation de tous les produits (SELECT + query + fetch)
$reponse = $db->query('SELECT * FROM produits ORDER BY id DESC');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion des produits</title>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="page-dashboard">
    <header>
        <a class="logo" href="produits.php">Produits</a>
    </header>

    <main>
        <h1 class="page-title">Gestion des produits</h1>
        <p class="page-sub">Connexion PHP avec MySQL, formulaire, insertion, selection, suppression et modification.</p>

        <div class="workout-card">
            <h2><?php echo $produitAModifier ? 'Modifier un produit' : 'Ajouter un produit'; ?></h2>

            <form method="POST" action="produits.php" class="modal-form">
                <?php if ($produitAModifier): ?>
                    <input type="hidden" name="id" value="<?php echo $produitAModifier['id']; ?>">
                <?php endif; ?>

                <div class="form-row">
                    <div class="form-group">
                        <label>Nom du produit</label>
                        <input type="text" name="nom" required value="<?php echo $produitAModifier ? $produitAModifier['nom'] : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label>Prix</label>
                        <input type="number" step="0.01" name="prix" required value="<?php echo $produitAModifier ? $produitAModifier['prix'] : ''; ?>">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Quantite</label>
                        <input type="number" name="quantite" required value="<?php echo $produitAModifier ? $produitAModifier['quantite'] : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" name="description" value="<?php echo $produitAModifier ? $produitAModifier['description'] : ''; ?>">
                    </div>
                </div>

                <?php if ($produitAModifier): ?>
                    <button type="submit" name="btn_modifier" class="modal-submit">Modifier</button>
                    <a href="produits.php" style="color: var(--muted); text-decoration: none;">Annuler</a>
                <?php else: ?>
                    <button type="submit" name="btn_ajouter" class="modal-submit">Ajouter</button>
                <?php endif; ?>
            </form>
        </div>

        <h2 style="margin-top: 32px;">Tableau des produits</h2>

        <div class="activity-list">
            <?php
            $i = 0;
            while ($produit = $reponse->fetch()) {
                $i++;
            ?>
                <div class="activity-row">
                    <div>
                        <div class="field-label">Nom</div>
                        <div class="field-value"><?php echo $produit['nom']; ?></div>
                    </div>
                    <div>
                        <div class="field-label">Prix</div>
                        <div class="field-value"><?php echo $produit['prix']; ?></div>
                    </div>
                    <div>
                        <div class="field-label">Quantite</div>
                        <div class="field-value"><?php echo $produit['quantite']; ?></div>
                    </div>
                    <div>
                        <div class="field-label">Description</div>
                        <div class="field-value"><?php echo $produit['description']; ?></div>
                    </div>
                    <div>
                        <a href="produits.php?modifier=<?php echo $produit['id']; ?>" style="color: var(--cyan);">Modifier</a>
                        <br>
                        <a href="produits.php?supprimer=<?php echo $produit['id']; ?>" onclick="return confirm('Supprimer ce produit ?')" style="color:red;">Supprimer</a>
                    </div>
                </div>
            <?php
            }
            $reponse->closeCursor();
            ?>

            <?php if ($i == 0): ?>
                <p style="color: var(--muted); text-align: center; padding: 40px;">Aucun produit enregistre.</p>
            <?php endif; ?>
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>
