// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Éléments du DOM ---
const guestListBody = document.getElementById('guest-list');
const presentCountEl = document.getElementById('present-count');
const totalCountEl = document.getElementById('total-count');

// --- NOUVEAU : Éléments de la Popup ---
const modal = document.getElementById('guest-modal');
const modalName = document.getElementById('modal-name');
const modalStatus = document.getElementById('modal-status');
const modalEmail = document.getElementById('modal-email');
const modalPhone = document.getElementById('modal-phone');
const closeModalBtn = document.getElementById('modal-close-btn');

let allGuestsData = []; // Pour stocker les données complètes

// --- Logique de la Liste ---
async function fetchAndDisplayGuests() {
    try {
        // On récupère toutes les colonnes nécessaires
        const { data: invites, error } = await supabaseClient
            .from('invites')
            .select('id, prenom, nom, statut, email, phone') // On ajoute email et phone
            .order('created_at', { ascending: true });

        if (error) throw error;

        allGuestsData = invites; // On sauvegarde les données
        guestListBody.innerHTML = '';

        const totalGuests = invites.length;
        const presentGuests = invites.filter(guest => guest.statut === 'présent').length;
        presentCountEl.textContent = presentGuests;
        totalCountEl.textContent = totalGuests;
        
        invites.forEach(guest => {
            const row = document.createElement('tr');
            row.dataset.guestId = guest.id; // On ajoute un identifiant à la ligne

            // On ajoute des data-label pour la version responsive
            const prenomCell = createCell(guest.prenom, "First Name");
            const nomCell = createCell(guest.nom, "Last Name");
            
            const statusCell = createCell('', "Status"); // Cellule vide pour le badge
            const statusBadge = document.createElement('span');
            statusBadge.textContent = guest.statut === 'présent' ? 'Present' : 'Registered';
            statusBadge.className = guest.statut === 'présent' ? 'status status-present' : 'status status-registered';
            statusCell.appendChild(statusBadge);
            
            row.appendChild(prenomCell);
            row.appendChild(nomCell);
            row.appendChild(statusCell);
            guestListBody.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des invités:", error);
        guestListBody.innerHTML = `<tr><td colspan="3">Error loading the list.</td></tr>`;
    }
}

// Helper pour créer les cellules avec les data-labels
function createCell(text, label) {
    const cell = document.createElement('td');
    cell.textContent = text;
    cell.dataset.label = label;
    return cell;
}

// --- NOUVEAU : Logique de la Popup ---

// Afficher les détails d'un invité
function showGuestDetails(guestId) {
    const guest = allGuestsData.find(g => g.id === guestId);
    if (!guest) return;

    modalName.textContent = `${guest.prenom} ${guest.nom}`;
    modalStatus.textContent = guest.statut === 'présent' ? 'Present' : 'Registered';
    modalEmail.textContent = guest.email;
    modalPhone.textContent = guest.phone;
    
    modal.style.display = 'flex'; // On affiche la popup
}

// Cacher la popup
function hideModal() {
    modal.style.display = 'none';
}

// Écouteurs d'événements
guestListBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row && row.dataset.guestId) {
        showGuestDetails(parseInt(row.dataset.guestId));
    }
});

closeModalBtn.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) { // Si on clique sur le fond gris
        hideModal();
    }
});

// Lancement
window.onload = function() {
    fetchAndDisplayGuests();
    setInterval(fetchAndDisplayGuests, 10000);
};
