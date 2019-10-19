module.exports = class Module {
  constructor(moduleSettings, modulesList) {
    this.CHANNEL = moduleSettings.CHANNEL ? moduleSettings.CHANNEL : 'bot';
    this.MODULES = modulesList;
  }

  register(bot) {
    bot.onReady(client => {
      if (!bot.isProduction) return; // Only send message on production bot

      let channel = client.channels.find(channel => channel.name === this.CHANNEL);
      if (channel === null) console.log(`Cannot send startup message, channel ${this.CHANNEL} not found.`)
      else {
        channel.send({
            embed: {
              color: 0xD05353,
              title: "Bot has been updated/restarted, this is what it can do",
              description: this.MODULES.get('HelpModule').HELP_TXT
          }
        });
      }
    });
  }

  get help() {
    return []
  }
}
