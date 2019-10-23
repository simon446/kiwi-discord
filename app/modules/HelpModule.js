function combineHelpText(modules) {
  let helpText = '';
  modules.forEach(current => {
    if (current.help !== undefined) {
      for (let line of current.help()) helpText += line + '\n';
    }
  });
  return helpText.substr(0, helpText.length - 1);
}

module.exports = class HelpModule {

  preload(bot) {
    this.bot = bot;
  }

  ready(bot) {
    bot.onCommand(this.COMMAND, (textMessage, discordMessage) => {
      discordMessage.channel.send({
          embed: {
            color: 0x38A1DA,
            title: "Help page",
            description: this.getHelpText()
        }
      });
    });
  }

  getHelpText() {
    return combineHelpText(this.bot.modules);
  }

  help() {
    return [`!**${this.COMMAND}** prints out a help page.`]
  }
}
