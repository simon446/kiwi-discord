const mathToPng = require('./AsciiMathToPng');

module.exports = class MathRenderModule {

    ready(bot) {
        bot.onCommand(this.COMMAND, async (messageString, discordMessage) => {
            try {
                discordMessage.channel.send(await this.mathToMessage(messageString, "AsciiMath"));
            } catch (err) {
                console.log(err)
                discordMessage.channel.send("Error converting input.");
            }
        });
    }

    async mathToMessage(expr, inputFormat) {
        let png;
        try {
            png = await mathToPng(expr, inputFormat);
        } catch (err) {throw err}

        return {
            files: [{attachment: png, name: "math.png"}]
        }
    }

    help() {
        return [`!**${this.COMMAND} expr** Responds with a rendered version of expr using http://asciimath.org/.`]
    }
}