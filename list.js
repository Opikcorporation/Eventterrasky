// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Éléments du DOM ---
const guestListBody = document.getElementById('guest-list');
const presentCountEl = document.getElementById('present-count');
const totalCountEl = document.getElementById('total-count');
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
            .select('id, prenom, nom, statut, email, phone')
            .order('created_at', { ascending: true });

        if (error) throw error;

        guestListBody.innerHTML = '';

        const totalGuests = invites.length;
        const presentGuests = invites.filter(guest => guest.statut === 'présent').length;
        presentCountEl.textContent = presentGuests;
        totalCountEl.textContent = totalGuests;
        
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
            
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `status ${guest.statut === 'présent' ? 'status-ok' : 'status-no'}`;
            statusBadge.textContent = guest.statut === 'présent' ? 'OK' : 'NO';
            statusCell.appendChild(statusBadge);

            row.appendChild(prenomCell);
            row.appendChild(nomCell);
            row.appendChild(statusCell);
            
            guestListBody.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des invités:", error);
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

// Écouteurs d'événements
guestListBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row && row.dataset.name) {
        showGuestDetails(row.dataset);
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
