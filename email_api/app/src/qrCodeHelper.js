let qr = require('qr-image');

let qrCodeHelper = {
    createQRCode: body => {
        console.log("Création du QRCode en cours");
        const templateOptions = body.templateOptions;

        // Generate QR Code from text
        let qrCodePng = qr.imageSync(qrCodeHelper.qrCodeText(templateOptions), { type: 'png' })

        console.log("Création du QRCode terminé pour l'utilisateur", templateOptions.lName, templateOptions.fName);

        return { result: qrCodePng.toString('base64') };
    },
    // Get the text to generate QR code
    qrCodeText: templateOptions => {
        let text = "Nom : " + templateOptions.lName
            + "\nPrénom : " + templateOptions.fName
            + "\nEntreprise : " + templateOptions.company;

        if (templateOptions.conferences.length == 1) {
            text += '\n\nRéservation :';
        } else {
            text += '\n\nRéservations :';
        }

        templateOptions.conferences.forEach(conf => {
            if(conf){
                text += '\n- ' + conf;
            }
        });

        return text;
    }
}

module.exports = qrCodeHelper;