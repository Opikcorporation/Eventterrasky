// ... (configuration supabase reste la même)
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const guestListBody = document.getElementById('guest-list');

async function fetchAndDisplayGuests() {
    try {
        const { data: invites, error } = await supabaseClient.from('invites').select('prenom, nom, statut').order('created_at', { ascending: true });
        if (error) throw error;
        guestListBody.innerHTML = '';
        invites.forEach(guest => {
            const row = document.createElement('tr');
            const prenomCell = document.createElement('td');
            prenomCell.textContent = guest.prenom;
            const nomCell = document.createElement('td');
            nomCell.textContent = guest.nom;
            const statusCell = document.createElement('td');
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
        console.error("Error fetching guests:", error);
        guestListBody.innerHTML = `<tr><td colspan="3">Error loading the list.</td></tr>`;
    }
}

window.onload = function() {
    fetchAndDisplayGuests();
    setInterval(fetchAndDisplayGuests, 10000);
};
