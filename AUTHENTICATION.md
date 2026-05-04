# Authentification PushPace - Guide d'Utilisation

## Crédentiels de Test

Deux comptes de test sont disponibles après l'initialisation de la base de données :

| Username | Email | Password |
|----------|-------|----------|
| `testuser` | test@example.com | `test123` |
| `demo` | demo@example.com | `test123` |

## Architecture d'Authentification

### Fichiers Modifiés/Créés

1. **api/config.php** - Modification
   - Ajout de `session_start()` au début
   - `getCurrentUserId()` - Récupère l'ID utilisateur depuis la session
   - `isAuthenticated()` - Vérifie si l'utilisateur est authentifié
   - `hashPassword($password)` - Hash un mot de passe en bcrypt
   - `verifyPassword($password, $hash)` - Vérifie un mot de passe
   - `loginUser($user_id)` - Crée une session utilisateur
   - `logoutUser()` - Détruit la session

2. **api/auth.php** - Nouveau fichier
   - **POST - action: register** - Crée un nouvel utilisateur
     - Paramètres: `username`, `email`, `password`
     - Validation: Email unique, username unique, password ≥ 6 caractères
   
   - **POST - action: login** - Authentifie un utilisateur
     - Paramètres: `username`, `password`
     - Réponse: `user_id`, `username`, `email`
   
   - **POST - action: logout** - Déconnecte l'utilisateur
     - Détruit la session
   
   - **GET** - Vérifie le statut d'authentification
     - Réponse: `{authenticated: boolean, user: {id, username, email, created_at}}`

3. **frontend/login.html** - Nouveau fichier
   - Interface de login/register
   - Formulaire de connexion
   - Formulaire d'inscription
   - Validation client
   - Redirection automatique si déjà connecté

4. **frontend/script.js** - Modification
   - `checkAuthentication()` - Vérifie l'authentification au chargement
   - `logout()` - Fonction globale de logout
   - Redirection vers login si non authentifié

5. **frontend/style.css** - Modification
   - Bouton logout stylisé dans le header
   - `.btn-logout` - Classe du bouton

6. **frontend/*.html** - Modifications
   - Ajout du bouton logout dans tous les headers
   - dashboard.html, walking.html, gym.html, running.html

7. **index.php** - Modification
   - Redirection vers login si non authentifié
   - Redirection vers dashboard si authentifié

## Flux d'Authentification

### 1. Inscription (Register)
```
1. Utilisateur remplit le formulaire d'inscription
2. POST /api/auth.php {action: 'register', username, email, password}
3. Vérification: email unique, username unique, password ≥ 6 caractères
4. Hash bcrypt du mot de passe
5. Insertion dans la base de données
6. Session créée automatiquement
7. Redirection vers dashboard
```

### 2. Connexion (Login)
```
1. Utilisateur remplit le formulaire de connexion
2. POST /api/auth.php {action: 'login', username, password}
3. Vérification: username existe, password correct
4. Session créée
5. Redirection vers dashboard
```

### 3. Déconnexion (Logout)
```
1. Clic sur bouton Logout
2. POST /api/auth.php {action: 'logout'}
3. Session détruite
4. Redirection vers login
```

### 4. Vérification d'Authentification
```
1. Chaque page vérifie l'authentification au chargement
2. GET /api/auth.php
3. Si non authentifié: redirection vers login
4. Si authentifié: page charge normalement
```

## Base de Données

Table `users` - Colonnes pertinentes pour l'authentification:
- `id` - Identifiant unique (PRIMARY KEY)
- `username` - Nom d'utilisateur (UNIQUE)
- `email` - Adresse email (UNIQUE)
- `password_hash` - Hash bcrypt du mot de passe
- `created_at` - Date de création
- `updated_at` - Date de dernière modification

## Sécurité

✅ **Implémenté:**
- Hash bcrypt des mots de passe (coût 12)
- Vérification des mots de passe
- Validation des emails
- Longueur minimale des mots de passe (6 caractères)
- Unicité username/email
- Sessions PHP
- Protection CORS
- Sanitization des inputs

⚠️ **À considérer pour la production:**
- HTTPS obligatoire
- CSRF tokens
- Rate limiting sur les endpoints d'authentification
- Validation plus stricte des mots de passe
- Logs d'accès
- Gestion d'expiration de session
- Refresh tokens (si applicable)

## Instructions d'Installation

1. Créer la base de données PushPace:
   ```sql
   Source database.sql
   ```

2. Redémarrer le serveur PHP/Apache

3. Accéder à `http://localhost/PushPace/`
   - Redirection automatique vers login.html
   - Utiliser les crédentiels de test pour se connecter

## Tests

### Test 1: Inscription
1. Aller sur login.html
2. Cliquer sur "Register here"
3. Remplir: username, email, mot de passe (min 6 chars)
4. Cliquer Register
5. Vérifier redirection vers dashboard

### Test 2: Connexion
1. Logout
2. Remplir: username=testuser, password=test123
3. Cliquer Login
4. Vérifier redirection vers dashboard

### Test 3: Protection des pages
1. Logout
2. Accéder directement à dashboard.html
3. Vérifier redirection vers login.html

### Test 4: Logout
1. Cliquer sur bouton Logout
2. Vérifier redirection vers login.html
3. Accéder dashboard → vérifier redirection vers login

## Endpoints API d'Authentification

### POST /api/auth.php - Register
```json
Request:
{
  "action": "register",
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}

Response (201):
{
  "success": true,
  "message": "User registered and logged in successfully",
  "user_id": 3,
  "username": "newuser"
}
```

### POST /api/auth.php - Login
```json
Request:
{
  "action": "login",
  "username": "testuser",
  "password": "test123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user_id": 1,
  "username": "testuser",
  "email": "test@example.com"
}
```

### POST /api/auth.php - Logout
```json
Request:
{
  "action": "logout"
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth.php - Check Authentication
```json
Response - Authenticated (200):
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2026-02-26 10:30:00"
  }
}

Response - Not Authenticated (200):
{
  "authenticated": false
}
```
