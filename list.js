// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Éléments du DOM ---
const guestListBody = document.getElementById('guest-list');
const presentCountEl = document.getElementById('present-count');
const totalCountEl = document.getElementById('total-count');
// NOUVEAUX ÉLÉMENTS POUR LES COMPTEURS DE LANGUE
const frCountEl = document.getElementById('fr-count');
const enCountEl = document.getElementById('en-count');
const modal = document.getElementById('guest-modal');
const modalName = document.getElementById('modal-name');
const modalStatus = document.getElementById('modal-status');
const modalEmail = document.getElementById('modal-email');
const modalPhone = document.getElementById('modal-phone');
const closeModalBtn = document.getElementById('modal-close-btn');

// --- Logique de la Liste ---
async function fetchAndDisplayGuests() {
    try {
        const { data: invites, error } = await supabaseClient
            .from('invites')
            // ON RÉCUPÈRE MAINTENANT LA COLONNE "language"
            .select('id, prenom, nom, statut, email, phone, language')
            .order('created_at', { ascending: true });

        if (error) throw error;

        guestListBody.innerHTML = '';

        // MISE À JOUR DES STATISTIQUES
        totalCountEl.textContent = invites.length;
        presentCountEl.textContent = invites.filter(g => g.statut === 'présent').length;
        // CALCUL DES COMPTEURS DE LANGUE
        frCountEl.textContent = invites.filter(g => g.language === 'FR').length;
        enCountEl.textContent = invites.filter(g => g.language === 'EN').length;
        
        invites.forEach(guest => {
            const row = document.createElement('tr');
            row.dataset.name = `${guest.prenom} ${guest.nom}`;
            row.dataset.status = guest.statut;
            row.dataset.email = guest.email;
            row.dataset.phone = guest.phone;

            const prenomCell = document.createElement('td');
            prenomCell.textContent = guest.prenom;

            const nomCell = document.createElement('td');
            nomCell.textContent = guest.nom;
            
            // NOUVELLE CELLULE POUR LE MENU DÉROULANT DE LANGUE
            const langCell = document.createElement('td');
            const langSelect = document.createElement('select');
            langSelect.className = 'language-select';
            langSelect.dataset.guestId = guest.id; // Pour savoir qui modifier
            ['', 'FR', 'EN'].forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = lang || '...';
                if (guest.language === lang) option.selected = true;
                langSelect.appendChild(option);
            });
            langCell.appendChild(langSelect);

            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `status ${guest.statut === 'présent' ? 'status-ok' : 'status-no'}`;
            statusBadge.textContent = guest.statut === 'présent' ? 'OK' : 'NO';
            statusCell.appendChild(statusBadge);

            row.appendChild(prenomCell);
            row.appendChild(nomCell);
            row.appendChild(langCell); // On ajoute la cellule au tableau
            row.appendChild(statusCell);
            
            guestListBody.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des invités:", error);
    }
}

// NOUVELLE FONCTION POUR METTRE À JOUR LA LANGUE
async function updateLanguage(guestId, newLanguage) {
    try {
        const { error } = await supabaseClient
            .from('invites')
            .update({ language: newLanguage })
            .eq('id', guestId);
        if (error) throw error;
        fetchAndDisplayGuests(); // On recharge la liste pour voir les compteurs se mettre à jour
    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        alert('Could not update language.');
    }
}

// --- Logique de la Popup ---
function showGuestDetails(guestData) {
    modalName.textContent = guestData.name;
    const isPresent = guestData.status === 'présent';
    modalStatus.innerHTML = `<span class="status ${isPresent ? 'status-ok' : 'status-no'}">${isPresent ? 'OK' : 'NO'}</span>`;
    modalEmail.textContent = guestData.email;
    modalPhone.textContent = guestData.phone;
    modal.style.display = 'flex';
}

function hideModal() {
    modal.style.display = 'none';
}

// ÉCOUTEURS D'ÉVÉNEMENTS MIS À JOUR
guestListBody.addEventListener('click', (e) => {
    // Si on clique sur une ligne mais PAS sur le menu déroulant, on ouvre la popup
    if (e.target.tagName !== 'SELECT') {
        const row = e.target.closest('tr');
        if (row && row.dataset.name) {
            showGuestDetails(row.dataset);
        }
    }
});

guestListBody.addEventListener('change', (e) => {
    // Si on change la valeur du menu déroulant, on met à jour la langue
    if (e.target.tagName === 'SELECT' && e.target.className === 'language-select') {
        const guestId = e.target.dataset.guestId;
        const newLanguage = e.target.value;
        updateLanguage(guestId, newLanguage);
    }
});

closeModalBtn.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Lancement
window.onload = function() {
    fetchAndDisplayGuests();
    setInterval(fetchAndDisplayGuests, 10000);
};
