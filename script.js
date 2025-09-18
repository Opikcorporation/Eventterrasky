console.log('Fichier script.js : Début du chargement.');

// Fonction pour générer le ticket en tant qu'image (Data URL)
function generateTicket(firstName, lastName) {
    console.log('Étape 3 : Appel de la fonction generateTicket().');
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Design du ticket
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 200);
    ctx.strokeStyle = '#166a60';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, 500, 200);
    
    // Titre de l'événement (à mettre à jour)
    ctx.fillStyle = '#166a60';
    ctx.font = 'bold 30px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('NOM DE L\'ÉVÉNEMENT', 250, 60);

    // Nom du participant
    ctx.fillStyle = '#333333';
    ctx.font = '24px Lato';
    ctx.fillText(`${firstName} ${lastName}`, 250, 110);
    
    // Texte "Ticket d'entrée"
    ctx.fillStyle = '#555555';
    ctx.font = 'italic 18px Lato';
    ctx.fillText("Ticket d'entrée personnel", 250, 140);

    // Numéro de ticket aléatoire
    const ticketId = `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    ctx.fillStyle = '#166a60';
    ctx.font = 'bold 16px Lato';
    ctx.fillText(ticketId, 250, 175);

    console.log('Étape 4 : Ticket généré avec succès.');
    return canvas.toDataURL('image/png');
}

// Attend que toute la page soit chargée avant d'exécuter le script
window.onload = function() {
    console.log('Étape 1 : La page est entièrement chargée (window.onload).');

    // Initialisation d'EmailJS avec votre Public Key
    try {
        emailjs.init('wKj_9D8jdsL0eHBXb');
        console.log('EmailJS initialisé avec succès.');
    } catch(e) {
        console.error('Erreur lors de l\'initialisation d\'EmailJS:', e);
        return; // Stoppe l'exécution si l'initialisation échoue
    }

    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');

    // Vérifie si le formulaire existe
    if (!contactForm) {
        console.error('Erreur critique : Le formulaire avec l\'ID "contact-form" est introuvable.');
        return;
    } else {
        console.log('Le formulaire #contact-form a été trouvé.');
    }

    // Ajoute l'écouteur d'événement sur la soumission du formulaire
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche le rechargement de la page
        console.log('Étape 2 : Le formulaire a été soumis (clic sur le bouton).');

        submitBtn.disabled = true;
        submitBtn.innerText = 'Envoi en cours...';

        const firstName = this.firstName.value;
        const lastName = this.lastName.value;
        const ticketDataUrl = generateTicket(firstName, lastName);
        
        const templateParams = {
            firstName: firstName,
            lastName: lastName,
            to_email: this.to_email.value,
            phone: this.phone.value,
            ticket: ticketDataUrl.split(',')[1] // Envoi de la partie base64 pure
        };

        const serviceID = 'service_2algan2'; 
        const templateID = 'template_viny53v';

        console.log('Étape 5 : Préparation de l\'envoi vers EmailJS avec les paramètres :', templateParams);

        emailjs.send(serviceID, templateID, templateParams)
            .then(function(response) {
                console.log('SUCCÈS ! Réponse du serveur :', response.status, response.text);
                statusMessage.innerText = 'Merci ! Votre invitation a été envoyée avec succès.';
                statusMessage.style.color = '#166a60';
                contactForm.reset();
            }, function(error) {
                console.error('ÉCHEC... Erreur renvoyée par EmailJS :', error);
                statusMessage.innerText = "Une erreur s'est produite. Vérifiez la console pour les détails.";
                statusMessage.style.color = 'red';
            })
            .finally(function() {
                console.log('Étape 6 : Fin de la tentative d\'envoi.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Obtenir mon invitation';
            });
    });

    console.log('L\'écouteur d\'événement est prêt et attend la soumission du formulaire.');
};

console.log('Fichier script.js : Fin du chargement.');
