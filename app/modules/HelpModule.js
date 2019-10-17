function combineHelpText(modules) {
  let helpText = '';
  modules.forEach(current => {
    for (let line of current.help) helpText += line + '\n';
  });
  return helpText.substr(0, helpText.length - 1);
}

module.exports = class HelpModule {
  constructor(moduleSettings, modulesList) {
    this.COMMAND = moduleSettings.COMMAND ? moduleSettings.COMMAND : 'help';
    this.MODULES = modulesList;
  }

  register(bot) {
    bot.onCommand(this.COMMAND, (messageString, discordMessage) => {
      
      discordMessage.channel.send({
          embed: {
            color: 0x38A1DA,
            title: "Help page",
            description: this.HELP_TXT
        }
      });
    });

    bot.onReadyPreload(client => {
      this.HELP_TXT = combineHelpText(this.MODULES);
    });
  }

  get help() {
    return [`!**${this.COMMAND}** prints out a help page.`]
  }
}
