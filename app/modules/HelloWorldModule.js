module.exports = class HelloWorldModule {

    ready(bot, client) {
        bot.onCommand(this.COMMAND, (textMessage, discordMessage) => {
            discordMessage.channel.send(this.TEXT);
        });
    }

    help() {
        return [`!**${this.COMMAND}** Responds with \`${this.TEXT}\`.`];
    }

}
