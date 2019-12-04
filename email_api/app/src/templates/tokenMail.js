module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS : options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS : options.to,
            subject: options.templateOptions.fName + ", finalisez votre inscription aux conférences MSIA17 2020 !",
            html: "<p>Cliquez sur le lien suivant pour valider votre inscription : " + options.templateOptions.url + "</p>"
        };
    }
    /*
    {
        "templateName": "tokenMail", 
        "data": {
            "from": "msia", 
            "to": "",   
            "templateOptions": 
            {
                "fName": ""
                "url": ""
            }
        }
    }
     */
}