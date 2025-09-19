// ====== CONFIGURATION SUPABASE ET EMAILJS ======
const supabaseUrl = 'https://vzmqbmhvhlnrjswitalz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bXFibWh2aGxucmpzd2l0YWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDg2OTEsImV4cCI6MjA3Mzc4NDY5MX0.xsZkApz6uI0aBf8OTbmTrGxSogt65buSZj1FbdFOLPw';
const emailjsPublicKey = 'wKj_9D8jdsL0eHBXb';
const emailjsServiceID = 'service_2algan2';
const emailjsTemplateID = 'template_viny53v';

// ====== INITIALISATION DES SERVICES ======
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
emailjs.init(emailjsPublicKey);

// Attend que toute la page soit chargée
window.onload = function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
        console.error('Erreur critique : Le formulaire est introuvable.');
        return;
    }

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('status-message');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enregistrement...';
        statusMessage.innerText = '';

        const prenom = this.firstName.value;
        const nom = this.lastName.value;
        const email = this.to_email.value;
        const phone = this.phone.value;

        try {
            // --- ÉTAPE 1 : Enregistrer l'invité dans la base de données Supabase ---
            console.log("Étape 1 : Envoi des données à Supabase...");
            const { data: inviteData, error: supabaseError } = await supabaseClient
                .from('invites')
                .insert([{ nom: nom, prenom: prenom, email: email, phone: phone }])
                .select()
                .single();

            if (supabaseError) throw new Error(`Erreur Supabase : ${supabaseError.message}`);
            
            const inviteId = inviteData.id;
            console.log(`Invité enregistré avec succès. ID unique : ${inviteId}`);

            // --- ÉTAPE 2 : Générer le QR Code avec l'ID unique ---
            console.log("Étape 2 : Génération du QR Code...");
            const qrCodeDataUrl = await QRCode.toDataURL(inviteId.toString(), { width: 200, margin: 2 });
            
            // --- ÉTAPE 3 : Envoyer l'email de confirmation avec le QR Code ---
            console.log("Étape 3 : Préparation de l'email de confirmation...");
            const templateParams = {
                firstName: prenom,
                lastName: nom,
                to_email: email,
                qr_code_image: qrCodeDataUrl.split(',')[1]
            };

            await emailjs.send(emailjsServiceID, emailjsTemplateID, templateParams);
            
            console.log("Email envoyé avec succès !");
            
            // --- MESSAGE DE SUCCÈS MODIFIÉ ICI ---
            statusMessage.innerHTML = 'Inscription réussie ! / Registration successful!<br>Pensez à vérifier vos spams. / Please check your spam folder.';
            
            statusMessage.style.color = '#166a60';
            contactForm.reset();

        } catch (error) {
            console.error("Une erreur est survenue durant le processus :", error);
            statusMessage.innerText = 'Une erreur est survenue. / An error occurred.';
            statusMessage.style.color = 'red';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Get My Invitation';
        }
    });
};
