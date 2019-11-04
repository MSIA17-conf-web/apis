require("dotenv").config();

const nodemailer = require('nodemailer'),
    qrCodeHelper = require("./qrCodeHelper");

let transporter = null;

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
            let email = body.userEmail;

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
    sendContactEmail: body => {
        return new Promise((resolve, reject) => {
            let email = body.userEmail;

            console.log("Ecriture du mail");
            let mailOptions = emailHelper.contactEmailTemplate(body);
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
    sendManyEmail: body => {
        return new Promise((resolve, reject) => {
            let error = [];

            var allEmail = body.userList.map((mailBody) => {
                return new Promise((resolve, reject) => {
                    emailHelper.sendEmail(mailBody)
                        .then(() => {
                            resolve({ result: 'Email sent to ' + mailBody.userEmail })
                        })
                        .catch(err => {
                            reject({ err: err })
                        })
                })
            })

            Promise.all(allEmail).then(results => {
                console.log("Result of many email sent : ", results);
                resolve(results)
            }).catch(err => {
                console.log("Error of many email sent : ", err);
                reject(err)

            })
        });
    },
    emailTemplate: body => {
        console.log("emailTemplate");
        let qrCode = qrCodeHelper.createQRCode(body);

        return {
            from: process.env.EMAIL_ADDRESS,
            to: body.userEmail,
            subject: "Sending Email using Node.js",
            html: "<h3>Bonjour " + body.lastName + " " + body.firstName + "</h3>"
                + "<p>Merci d'avoir réservé sur notre site.</p>"
                + "<p>Veuillez trouver en pièce jointe un QRCode permettant de vous identifiez le jour J. Gardé le précieusement.</p>"
                + "<img src='data:image/png;base64," + qrCode.result + "'>",

            attachments: [{   // encoded string as an attachment
                filename: "QRCode-" + body.lastName + "-" + body.firstName + ".png",
                content: qrCode.result,
                encoding: "base64"
            }]
        };
    },
    contactEmailTemplate: body => {
        console.log("contactEmailTemplate");

        const lastName = body.lastName, firstName = body.firstName

        return {
            from: body.userEmail,
            to: process.env.EMAIL_ADDRESS,
            subject: lastName + " " + firstName + " cherche à nous contacter",
            html: "<h3>Message :</h3>"
                + "<p>" + body.messageEmail + "</p>"
        };
    }
}

module.exports = emailHelper;