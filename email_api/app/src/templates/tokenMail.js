const header = require('./html').header
const footer = require('./html').footer

module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS : options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS : options.to,
            subject: options.templateOptions.fName + ", finalisez votre inscription aux conférences MSIA17 2020 !",
            html: header
                + "<a href=\"" + options.templateOptions.url + "\">Cliquez ici pour valider votre inscription</a></br>"
                + "<p style=\"font-size=\"8px\" \"><a href=\"" + options.templateOptions.url + "\">"+ options.templateOptions.url +"</a></p>"
                + footer
        };
    }
    /* {
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
    } */
}