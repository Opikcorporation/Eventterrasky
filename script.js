// ====== CONFIGURATION SUPABASE ET EMAILJS ======

// !! IMPORTANT !! Remplacez par vos propres informations Supabase
const supabaseUrl = 'VOTRE_URL_SUPABASE'; // Trouvée dans Settings > API
const supabaseKey = 'VOTRE_CLE_ANON_SUPABASE'; // Trouvée dans Settings > API

// Vos informations EmailJS (ne changent pas)
const emailjsPublicKey = 'wKj_9D8jdsL0eHBXb';
const emailjsServiceID = 'service_2algan2';
const emailjsTemplateID = 'template_viny53v';

// ====== INITIALISATION DES SERVICES ======
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
emailjs.init(emailjsPublicKey);

// Attend que toute la page soit chargée
window.onload = function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
        console.error('Erreur critique : Le formulaire est introuvable.');
        return;
    }

    // On utilise une fonction "async" car on doit attendre la réponse de la base de données
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('status-message');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enregistrement...';
        statusMessage.innerText = '';

        // Récupérer les données du formulaire
        const prenom = this.firstName.value;
        const nom = this.lastName.value;
        const email = this.to_email.value;
        const phone = this.phone.value;

        try {
            // --- ÉTAPE 1 : Enregistrer l'invité dans la base de données Supabase ---
            console.log("Étape 1 : Envoi des données à Supabase...");
            const { data: inviteData, error: supabaseError } = await supabase
                .from('invites')
                .insert([{ nom: nom, prenom: prenom, email: email, phone: phone }])
                .select() // .select() nous retourne l'entrée qui vient d'être créée
                .single(); // On s'attend à un seul résultat

            if (supabaseError) {
                // Si Supabase renvoie une erreur (ex: email déjà existant), on l'affiche
                throw new Error(`Erreur Supabase : ${supabaseError.message}`);
            }
            
            const inviteId = inviteData.id;
            console.log(`Invité enregistré avec succès. ID unique : ${inviteId}`);

            // --- ÉTAPE 2 : Générer le QR Code avec l'ID unique ---
            console.log("Étape 2 : Génération du QR Code...");
            // QRCode.toDataURL renvoie une image en base64
            const qrCodeDataUrl = await QRCode.toDataURL(inviteId.toString(), { width: 200, margin: 2 });
            console.log("QR Code généré.");

            // --- ÉTAPE 3 : Envoyer l'email de confirmation avec le QR Code ---
            console.log("Étape 3 : Préparation de l'email de confirmation...");
            const templateParams = {
                firstName: prenom,
                lastName: nom,
                to_email: email,
                qr_code_image: qrCodeDataUrl.split(',')[1] // On envoie juste la data base64
            };

            console.log("Envoi de l'email via EmailJS...");
            await emailjs.send(emailjsServiceID, emailjsTemplateID, templateParams);
            
            console.log("Email envoyé avec succès !");
            statusMessage.innerText = 'Inscription réussie ! Votre billet a été envoyé par email.';
            statusMessage.style.color = '#166a60';
            contactForm.reset();

        } catch (error) {
            // Gérer n'importe quelle erreur des étapes ci-dessus
            console.error("Une erreur est survenue durant le processus :", error);
            statusMessage.innerText = 'Une erreur est survenue. Veuillez réessayer.';
            statusMessage.style.color = 'red';
        } finally {
            // Dans tous les cas (succès ou échec), on réactive le bouton
            submitBtn.disabled = false;
            submitBtn.innerText = 'Obtenir mon invitation';
        }
    });
};
