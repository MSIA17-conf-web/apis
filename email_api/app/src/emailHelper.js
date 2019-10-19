require("dotenv").config();

let nodemailer = require('nodemailer'),
    qrCodeHelper = require("./qrCodeHelper"),
    transporter = null;

let emailHelper = {
    initTransporter: () => {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    },
    sendEmail: body => {
        return new Promise((resolve, reject) => {
            let email = body.email;

            console.log("Ecriture du mail");
            let mailOptions = emailHelper.emailTemplate(body);
            console.log("Ecriture du mail terminé");

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log("Error sending mail to", email, err);
                    reject({ err: err });
                } else {
                    console.log('Email sent to ' + email);
                    resolve({ result: 'Email sent to ' + email });
                }
            });
        });
    },
    sendManyEmail: data => {
        return new Promise((resolve, reject) => {
            let error = [];

            data.forEach(user => {
                new Promise((resolve, reject) => {
                    let userInformations = {
                        lastName: user.lastName,
                        firstName: user.firstName,
                        enterpriseName: user.enterpriseName,
                        email: user.email
                    }
                    console.log("rrrrrrrrrrrrrrrrrr", userInformations);

                    let mailOptions = emailHelper.emailTemplate(user);

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log("Error sending mail to", userInformations.email, err);
                            reject({
                                err: err,
                                userInformations: userInformations
                            });
                        } else {
                            resolve({ result: userInformations.email });
                        }
                    });
                }).then(result => {
                    console.log("Email sent to", result.result);
                }).catch(err => {
                    console.log("yoloooooooooooooooooo");
                    error.push(err);
                });
            });
        });
    },
    emailTemplate: body => {
        console.log("emailTemplate");
        let qrCode = qrCodeHelper.createQRCode(body);

        return {
            from: process.env.EMAIL_ADDRESS,
            to: body.email,
            subject: "Sending Email using Node.js",
            html: "<h3>Bonjour " + body.lastName + " " + body.firstName + "</h3>"
                + "<p>Merci d'avoir réservé sur notre site.</p>"
                + "<p>Veuillez trouver en pièce jointe un QRCode permettant de vous identifiez le jour J. Gardé le précieusement.</p>",
            attachments: [{   // encoded string as an attachment
                filename: "QRCode-" + body.lastName + "-" + body.firstName + ".png",
                content: qrCode.result,
                encoding: "base64"
            }]
        };
    }
}

module.exports = emailHelper;