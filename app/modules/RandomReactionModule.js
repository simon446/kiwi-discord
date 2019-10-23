module.exports = class HelloWorldModule {

  ready(bot) {
    bot.onMessage(discordMessage => {
      let r = Math.random();
      if (r <= 1.0 / this.ONE_IN) {
        discordMessage.react(this.REACTION);
      }
    });
  }

  help() {
    return [`**any message** Responds with ${this.REACTION} with a probability of ${(100.0/this.ONE_IN)}%`];
  }
}
