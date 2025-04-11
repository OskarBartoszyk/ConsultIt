// Pobieramy przyciski zakładek oraz sekcje z ofertami
const businessTab = document.getElementById('business-tab');
const individualTab = document.getElementById('individual-tab');
const businessCards = document.querySelector('.business-cards');
const individualCards = document.querySelector('.individual-cards');

// Funkcja przełączania zakładek
function activateTab(tab) {
  if (tab === 'business') {
    businessTab.classList.add('active');
    individualTab.classList.remove('active');
    businessCards.classList.remove('hidden');
    individualCards.classList.add('hidden');
  } else if (tab === 'individual') {
    individualTab.classList.add('active');
    businessTab.classList.remove('active');
    individualCards.classList.remove('hidden');
    businessCards.classList.add('hidden');
  }
}

// Nasłuchiwanie zdarzeń kliknięć
businessTab.addEventListener('click', () => {
  activateTab('business');
});

individualTab.addEventListener('click', () => {
  activateTab('individual');
});
