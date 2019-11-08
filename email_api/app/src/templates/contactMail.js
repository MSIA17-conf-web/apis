module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from ,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to ,
            subject: options.lName + " " + options.fName + " cherche à nous contacter",
            html: "<p><b>Nom de l'entreprise : </b>" + options.company + "</p>"
                + "<h4>Message :</h4>"
                + "<p>" + options.messageEmail + "</p>"
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