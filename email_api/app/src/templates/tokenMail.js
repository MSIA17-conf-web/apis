module.exports = {
    getTemplate(options) {
        return {
            from: options.from === "msia" ? process.env.EMAIL_ADDRESS: options.from,
            to: options.to === "msia" ? process.env.EMAIL_ADDRESS: options.to,
            subject: options.fName + ", finalisez votre inscription au conférences MSIA17 2019 !",
            html: "<p>Cliquez sur ce lien pour valider votre inscription : " + options.url + "</p>"
        };
    }
}