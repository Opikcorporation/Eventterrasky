// ... (configuration supabase reste la même)
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const resultDiv = document.getElementById('result');

async function onScanSuccess(decodedText, decodedResult) {
    const inviteId = decodedText;
    html5QrcodeScanner.clear();
    
    try {
        let { data: invite, error } = await supabaseClient.from('invites').select('prenom, nom, statut').eq('id', inviteId).single();

        if (error || !invite) {
            showResult("❌ Invalid Ticket", "error");
            return;
        }

        if (invite.statut === 'présent') {
            showResult(`⚠️ Ticket already scanned for ${invite.prenom} ${invite.nom}`, "warning");
        } else {
            const { error: updateError } = await supabaseClient.from('invites').update({ statut: 'présent' }).eq('id', inviteId);
            if (updateError) throw new Error(updateError.message);
            showResult(`✅ Welcome ${invite.prenom} ${invite.nom}!`, "success");
        }
    } catch (err) {
        showResult("❌ Database Error", "error");
        console.error(err);
    }
}

function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = type;
    resultDiv.style.display = 'block';
    setTimeout(() => {
        resultDiv.style.display = 'none';
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }, 5000);
}

function onScanFailure(error) { /* Ignore */ }

let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
