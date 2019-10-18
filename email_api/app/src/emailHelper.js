require("dotenv").config();

let nodemailer = require('nodemailer'),
    qrcodeHelper = require("./qrcodeHelper");

let emailHelper = {
    sendEmail: body => {
        return new Promise((resolve, reject) => {
            console.log("process.env.EMAIL_ADDRESS", process.env.EMAIL_ADDRESS);
            console.log("process.env.EMAIL_PASSWORD", process.env.EMAIL_PASSWORD);



            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_ADDRESS,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            let mailOptions = emailHelper.emailTemplate(body)
                .then(result => {
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log("err: ", err);

                            reject({ err: err });
                        } else {
                            console.log('Email sent from ' + body.userEmail);

                            resolve({ result: 'Email sent from ' + body.userEmail });
                        }
                    });
                })
                .catch(err => reject({ err: err }));
        });
    },
    emailTemplate: body => {
        return new Promise((resolve, reject) => {
            let mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: body.userEmail,
                subject: 'Sending Email using Node.js'
            };

            // call qrcode, if error mettre text avec les infos, sinon mettre buffer dans img
            qrcodeHelper.createQRCode(req.body)
                .then(result => {
                    mailOptions.attachments = [{
                        filename: 'test1.png',
                        content: atob(result.result)
                    },
                    {   // encoded string as an attachment
                        filename: 'test2.png',
                        content: result.result,
                        encoding: 'base64'
                    },
                    {   // data uri as an attachment
                        path: 'data:image/png;' + result.result
                    }];
                })
                .catch(err => {
                    console.log("Error with createQRCode function", err);
                    reject(err);
                });

            ;
        });
    }
}

module.exports = emailHelper;