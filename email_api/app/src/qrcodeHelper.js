let qr = require('qr-image');

let qrcodeHelper = {
    createQRCode: body => {
        return new Promise((resolve, reject) => {
            let qrCodeText = "", lastName = body.lastName,
                firstName = body.firstName, enterpriseName = body.enterpriseName,
                reservationsList = body.reservationsList;

            let error = [];

            if (!lastName || !firstName || !enterpriseName) {
                if (!lastName) {
                    error.push({ errLastName: true });
                }

                if (!firstName) {
                    error.push({ errFirstName: true });
                }

                if (!enterpriseName) {
                    error.push({ errEnterpriseName: true });
                }

                reject({ err: error });
            } else {
                // Get the text to generate QR code
                qrCodeText = "Nom : " + lastName
                    + "\nPrénom : " + firstName
                    + "\nEntreprise : " + enterpriseName;

                if (reservationsList && reservationsList.length != 0) {
                    if (reservationsList.length == 1) {
                        qrCodeText += '\n\nRéservation :';
                    } else {
                        qrCodeText += '\n\nRéservations :';
                    }

                    reservationsList.forEach(reservation => {
                        qrCodeText += '\n- ' + reservation;
                    });

                    // Generate QR Code from text
                    let qrCodePng = qr.imageSync(qrCodeText, { type: 'png' })

                    resolve({ result: qrCodePng.toString('base64') });
                } else {
                    reject({
                        err: [{
                            errReservationsListEmpty: true
                        }]
                    });
                }
            }
        });
    }
}

module.exports = qrcodeHelper;