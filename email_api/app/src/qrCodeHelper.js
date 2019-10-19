let qr = require('qr-image');

let qrCodeHelper = {
    createQRCode: body => {
        console.log("Création du QRCode en cours");

        // Generate QR Code from text
        let qrCodePng = qr.imageSync(qrCodeHelper.qrCodeText(body), { type: 'png' })

        console.log("Création du QRCode terminé pour l'utilisateur", body.lastName, body.firstName);

        return { result: qrCodePng.toString('base64') };
    },
    // Get the text to generate QR code
    qrCodeText: body => {
        let text = "Nom : " + body.lastName
            + "\nPrénom : " + body.firstName
            + "\nEntreprise : " + body.enterpriseName;

        if (body.reservationsList.length == 1) {
            text += '\n\nRéservation :';
        } else {
            text += '\n\nRéservations :';
        }

        body.reservationsList.forEach(reservation => {
            text += '\n- ' + reservation;
        });

        return text;
    }
}

module.exports = qrCodeHelper;