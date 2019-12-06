const header = require('./html').header
const footer = require('./html').footer

module.exports = {
    getTemplate(options, path) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to,
            subject: "Confirmation de mise à jour",
            html: header
                + "<h3>Bonjour " + options.templateOptions.fName + " " + options.templateOptions.lName + "</h3>"
                + "<p>Vos données on été correctement mises à jour.</p>"
                + "<p>Veuillez trouver en pièce jointe un nouveau QRCode permettant de vous identifiez le jour des conférences. Gardez le précieusement.</p>"
                // Je cois l'image ne marche pas
                + "<a href='https://msia17conferences.com" + path + "/inscription?userdata=" + options.userdata + "&delete=true' target='_blank'>Se désinscrire</a> | "
                + "<a href='https://msia17conferences.com" + path + "/inscription?userdata=" + options.userdata + "&update=true' target='_blank'>Modifier mes informations</a>"
                + footer,
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