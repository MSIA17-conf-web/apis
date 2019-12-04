module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from ,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to ,
            subject: options.templateOptions.lName + " " + options.templateOptions.fName + " cherche à nous contacter",
            html: "<p><b>Nom de l'entreprise : </b>" + options.templateOptions.company + "</p>"
                + "<h4>Message :</h4>"
                + "<p>" + options.templateOptions.messageEmail + "</p>"
        };
    }
    /*
    {
        "templateName": "contactMail", 
        "data": {
            "from": "msia", 
            "to": "",   
            "templateOptions": 
            {
                "lName": "",
                "fName": "", 
                "company": "",
                "messageEmail" : ""
            }
        }
    }
    */
}