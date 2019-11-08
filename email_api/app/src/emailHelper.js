require("dotenv").config();
const nodemailer = require('nodemailer'),
    qrCodeHelper = require("./qrCodeHelper"),
    { templates } = require('./templates');

let transporter = null;

let emailHelper = {
    initTransporter: (cb) => {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        cb();
    },
    sendMail: body => {
        return new Promise((resolve, reject) => {
            let mailOptions;
            console.log("Ecriture du mail");
            switch (body.templateName) {
                case 'tokenMail':
                    mailOptions = templates.tokenTemplate.getTemplate(body.data);
                    break;
                case 'testMail':
                    body.data.qrCode = qrCodeHelper.createQRCode(body.data);
                    mailOptions = templates.testTemplate.getTemplate(body.data);
                    break;
                case 'contactMail':
                    mailOptions = templates.contactTemplate.getTemplate(body.data);
                    break;
                default:
                    reject({ err: body.templateName + 'template name not supported' });
                    break;
            }
            console.log("Ecriture du mail terminé");
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log("Error sending mail to" + mailOptions.to, err);
                    reject({ err: err, info: info });
                } else {
                    console.log('Email sent to ' + mailOptions.to);
                    resolve({ result: 'Email sent to ' + mailOptions.to });
                }
            });
        });
    },
    sendManyMail: body => {
        return new Promise((resolve, reject) => {
            var allEmail = body.userList.map((mailBody) => {
                return new Promise((resolve, reject) => {
                    emailHelper.sendMail(mailBody)
                        .then(() => {
                            resolve({ result: 'Email sent to ' + mailBody.data.to })
                        })
                        .catch(err => {
                            reject({ err: err })
                        });
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
    }
}

module.exports = emailHelper;