const axios = require('axios')

function findPod(wolframApiResponse, podName) {
    try {
        if (wolframApiResponse.queryresult.success === false) return null;

        for (let pod of wolframApiResponse.queryresult.pods) {
            if (pod.title === podName) {
                return pod;
            }
        }
    } catch (err) {console.log(err);}
    return null;
}

module.exports = class WolframAlpha {

    ready(bot, client) {  

        bot.onCommand(this.COMMAND, async (textMessage, discordMessage) => {
            let response = await axios.get(`http://api.wolframalpha.com/v2/query?output=json&format=mathml&input=${encodeURIComponent(textMessage)}&appid=${this.APP_ID}`);
        
            let mathrendermodule = bot.modules.get('mathrendermodule')

            let inputPod = findPod(response.data, 'Input');
            let resultPod = findPod(response.data, 'Result');
            let solutionPod = findPod(response.data, 'Solution');
            if (solutionPod === null) solutionPod = findPod(response.data, 'Solutions');

            if (solutionPod !== null || inputPod !== null) {
                if (resultPod !== null) {
                    for (let subpod of resultPod.subpods) {await discordMessage.channel.send(await mathrendermodule.mathToMessage(subpod.mathml, 'MathML'))}
                } else if (inputPod !== null) {
                    for (let subpod of inputPod.subpods) {await discordMessage.channel.send(await mathrendermodule.mathToMessage(subpod.mathml, 'MathML'))}
                }
                
                if (solutionPod !== null) for (let subpod of solutionPod.subpods) {await discordMessage.channel.send(await mathrendermodule.mathToMessage(subpod.mathml, 'MathML'))}
            } else {
                discordMessage.channel.send('Invalid input.')
            }

        });

    }

    help() {
        return [`!**${this.COMMAND} expr** solves expr using wolfram alpha.`]
    }
}
