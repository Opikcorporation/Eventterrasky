// --- Configuration Supabase ---
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Logique du Scanner ---
const resultDiv = document.getElementById('result');

// Fonction qui se déclenche quand un QR code est lu
async function onScanSuccess(decodedText, decodedResult) {
    // decodedText contient l'ID unique de l'invité
    const inviteId = decodedText;
    
    // Mettre en pause le scanner pour éviter de scanner plusieurs fois
    html5QrcodeScanner.clear();
    
    try {
        // Interroger la base de données pour trouver l'invité par son ID
        let { data: invite, error } = await supabase
            .from('invites')
            .select('prenom, nom, statut')
            .eq('id', inviteId)
            .single();

        if (error || !invite) {
            showResult("❌ Ticket Invalide", "error");
            return;
        }

        // Vérifier le statut de l'invité
        if (invite.statut === 'présent') {
            showResult(`⚠️ Ticket déjà scanné pour ${invite.prenom} ${invite.nom}`, "warning");
        } else {
            // Mettre à jour le statut à "présent"
            const { error: updateError } = await supabase
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

    // Redémarrer le scanner après 5 secondes
    setTimeout(() => {
        resultDiv.style.display = 'none';
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }, 5000);
}

function onScanFailure(error) {
    // Gérer les erreurs de scan, mais on peut souvent l'ignorer
}

// Initialiser le scanner
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: {width: 250, height: 250} }, 
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
