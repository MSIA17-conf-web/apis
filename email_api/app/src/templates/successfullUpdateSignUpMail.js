module.exports = {
    getTemplate(options) {
        console.log("<img src='data:image/png;base64," + options.qrCode.result + "'>");
        
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to,
            subject: "Confirmation de mise à jour",
            html: "<h3>Bonjour " + options.templateOptions.lName + " " + options.templateOptions.fName + "</h3>"
                + "<p>Vos données ont correctement été mise à jour..</p>"
                + "<p>Veuillez trouver en pièce jointe un nouveau QRCode permettant de vous identifiez le jour des conférences. Gardé le précieusement.</p>"
                // Je cois l'image ne marche pas
                + "<img src='data:image/png;base64," + options.qrCode.result + "'>"
                + "<a href='https://msia17conferences.com/dev/inscription?userdata=" + options.userdata + "&delete=true' target='_blank'>Se Désinscrire</a> | "
                + "<a href='https://msia17conferences.com/dev/inscription?userdata=" + options.userdata + "&update=true' target='_blank'>Modifier mes informations</a>",

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