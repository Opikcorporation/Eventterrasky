// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Logique de la Liste ---
const guestListBody = document.getElementById('guest-list');

// Fonction pour récupérer et afficher les invités
async function fetchAndDisplayGuests() {
    try {
        // 1. Récupérer tous les invités de la table, triés par date d'inscription
        const { data: invites, error } = await supabase
            .from('invites')
            .select('prenom, nom, statut')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // 2. Vider la liste actuelle pour éviter les doublons
        guestListBody.innerHTML = '';

        // 3. Remplir la liste avec les nouvelles données
        invites.forEach(guest => {
            const row = document.createElement('tr');
            
            const prenomCell = document.createElement('td');
            prenomCell.textContent = guest.prenom;
            
            const nomCell = document.createElement('td');
            nomCell.textContent = guest.nom;
            
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.textContent = guest.statut === 'présent' ? 'Présent' : 'Inscrit';
            statusBadge.className = guest.statut === 'présent' ? 'status status-present' : 'status status-registered';
            
            statusCell.appendChild(statusBadge);
            row.appendChild(prenomCell);
            row.appendChild(nomCell);
            row.appendChild(statusCell);
            
            guestListBody.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des invités:", error);
        guestListBody.innerHTML = `<tr><td colspan="3">Erreur de chargement de la liste.</td></tr>`;
    }
}

// Lancer la fonction au chargement de la page, puis toutes les 10 secondes
window.onload = function() {
    fetchAndDisplayGuests(); // Premier chargement
    setInterval(fetchAndDisplayGuests, 10000); // Mise à jour toutes les 10 secondes
};
