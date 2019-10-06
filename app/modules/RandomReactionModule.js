module.exports = class HelloWorldModule {

  constructor(st) {
    this.REACTION = st.REACTION !== undefined ? st.REACTION : "🎉";
    this.ONE_IN = st.ONE_IN !== undefined ? st.ONE_IN : 2;
  }

  register(bot) {
    bot.onMessage(discordMessage => {
      let r = Math.random();
      if (r <= 1 / this.ONE_IN) {
        discordMessage.react(this.REACTION);
      }
    });
  }

  get help() {
    return [];
  }
}
