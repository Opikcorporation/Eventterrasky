// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';

// CORRECTION : On nomme notre client "supabaseClient" pour éviter le conflit
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Logique du Scanner ---
const resultDiv = document.getElementById('result');

// Fonction qui se déclenche quand un QR code est lu
async function onScanSuccess(decodedText, decodedResult) {
    const inviteId = decodedText;
    html5QrcodeScanner.clear();
    
    try {
        // CORRECTION : On utilise "supabaseClient" ici
        let { data: invite, error } = await supabaseClient
            .from('invites')
            .select('prenom, nom, statut')
            .eq('id', inviteId)
            .single();

        if (error || !invite) {
            showResult("❌ Ticket Invalide", "error");
            return;
        }

        if (invite.statut === 'présent') {
            showResult(`⚠️ Ticket déjà scanné pour ${invite.prenom} ${invite.nom}`, "warning");
        } else {
            // CORRECTION : On utilise "supabaseClient" ici
            const { error: updateError } = await supabaseClient
                .from('invites')
                .update({ statut: 'présent' })
                .eq('id', inviteId);

            if (updateError) {
                throw new Error(updateError.message);
            }
            
            showResult(`✅ Bienvenue ${invite.prenom} ${invite.nom} !`, "success");
        }

    } catch (err) {
        showResult("❌ Erreur de base de données", "error");
        console.error(err);
    }
}

// Fonction pour afficher le résultat du scan
function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = type;
    resultDiv.style.display = 'block';

    setTimeout(() => {
        resultDiv.style.display = 'none';
        if (html5QrcodeScanner.getState() === 2) { // 2 = SCANNING
             // Ne rien faire si le scanner est déjà actif
        } else {
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        }
    }, 5000);
}

function onScanFailure(error) {
    // On peut ignorer les erreurs de "QR code not found"
}

// Initialiser le scanner
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: {width: 250, height: 250} }, 
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
