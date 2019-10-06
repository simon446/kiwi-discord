module.exports = class HelloWorldModule {
  constructor(moduleSettings) {
    let settings = Object.assign({
      COMMAND: "hello",
      TEXT: "Hello world!"
    }, moduleSettings);
    
    this.TEXT = settings.TEXT;
    this.COMMAND = settings.COMMAND;
  }

  register(bot) {
    bot.onCommand(this.COMMAND, (messageString, discordMessage) => {
      discordMessage.channel.send(this.TEXT);
    });
  }

  get help() {
    return [`!**${this.COMMAND}** Responds with \`${this.TEXT}\`.`]
  }
}
