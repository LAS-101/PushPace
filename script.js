// script.js - Effets visuels simples (Niveau débutant)

document.addEventListener('DOMContentLoaded', () => {
  // Animation d'entrée pour les cartes
  const cards = document.querySelectorAll('.stat-card, .act-card, .activity-row, .workout-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 80);
  });
});