module.exports = class Module {

  ready(bot, client) {  
    if (!bot.isProduction) return; // Only send message on production bot

    let channel = client.channels.find(channel => channel.name === this.CHANNEL);
    if (channel === null) console.log(`Cannot send startup message, channel ${this.CHANNEL} not found.`)
    else {
      let helpModule = bot.modules.get('HelpModule');
      channel.send({
          embed: {
            color: 0xD05353,
            title: "Bot has been updated/restarted, this is what it can do",
            description: helpModule.getHelpText()
        }
      });
    }
  }
}
