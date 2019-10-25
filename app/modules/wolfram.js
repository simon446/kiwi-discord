const axios = require('axios')

function getPodParams(wolframApiResponse, param='title') {
    let ret = new Map();
    try {
        if (wolframApiResponse.queryresult.success === false) return null;
        for (let pod of wolframApiResponse.queryresult.pods) {
            ret.set(pod[param], pod);
        }
    } catch (err) {console.log(err);return null;}
    return ret;
}

function getPods(wolframApiResponse, config) {
    config = config.split('&').map(str => str.split('|'));
    let podMap = getPodParams(wolframApiResponse);
    if (podMap === null) return null;
    let pods = [];

    for (let i = 0; i < config.length; i++) {
        const lst = config[i];
        for (let j = 0; j < lst.length; j++) {
            const param = lst[j];
            if (podMap.has(param)) {
                pods.push(podMap.get(param))
                break;
            }
        }
    }

    return pods;
}

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

            let pods = getPods(response.data, 'Result|Results|Input&Solution|Solutions|Alternate forms&Definite integral&Indefinite integral&Derivative');

            if (pods === null) {
                discordMessage.channel.send('Invalid input.')
            } else if (pods.length === 0) {
                discordMessage.channel.send(Array.from(getPodParams(response.data)).map(e=>e[0]).toString())
            } else {
                for (let pod of pods) {
                    await discordMessage.channel.send(pod.title);
                    for (let subpod of pod.subpods) {
                        try {
                            await discordMessage.channel.send(await mathrendermodule.mathToMessage(subpod.mathml, 'MathML'))
                        } catch (err) {}
                    }
                }
            }

           /*  let inputPod = findPod(response.data, 'Input');
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
            } */

        });

    }

    help() {
        return [`!**${this.COMMAND} expr** solves expr using wolfram alpha.`]
    }
}
