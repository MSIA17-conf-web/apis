module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to,
            subject: "Sending Email using Node.js",
            html: "<h3>Bonjour " + options.templateOptions.lName + " " + options.templateOptions.fName + "</h3>"
                + "<p>Merci d'avoir réservé sur notre site.</p>"
                + "<p>Veuillez trouver en pièce jointe un QRCode permettant de vous identifiez le jour J. Gardé le précieusement.</p>"
                + "<img src='data:image/png;base64," + options.qrCode.result + "'>",

            attachments: [{   // encoded string as an attachment
                filename: "QRCode-" + options.templateOptions.lName + "-" + options.templateOptions.fName + ".png",
                content: options.qrCode.result,
                encoding: "base64"
            }]
        };
    }
    /*
    {
        "templateName": "testMail", 
        "data": {
            "from": "msia", 
            "to": "",   
            "templateOptions": 
            {
                "lName": ""
                "fName": "", 
                "company": "",
                "conferences" : []
            }
        }
    }
    */
}