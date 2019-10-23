const asciiMathToPng = require('./AsciiMathToPng');

module.exports = class MathRenderModule {

    ready(bot) {
        bot.onCommand(this.COMMAND, async (messageString, discordMessage) => {
            let png;
            try {
                png = await asciiMathToPng(messageString);
            } catch (err) {
                console.log(err);
                discordMessage.channel.send("Error converting input.");
                return;
            }

            discordMessage.channel.send({
                files: [{attachment: png, name: "math.png"}]
            });
        });
    }

    help() {
        return [`!**${this.COMMAND} expr** Responds with a rendered version of expr using http://asciimath.org/.`]
    }
}