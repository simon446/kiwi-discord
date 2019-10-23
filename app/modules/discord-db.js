/**
 * Use a discord message as a database
 */

module.exports = class DiscordDB {
    ready(bot, client) {
        bot.onCommand(this.COMMAND, async (messageString, discordMessage) => {
            let args = messageString.split('=');
            args = args.map(arg => arg.trim());
            let db = await this.getDB();
            if (args[1] !== undefined) {
                try {
                    db[args[0]] = JSON.parse(args[1]);
                } catch (err) {
                    return discordMessage.channel.send('Invalid input')
                }
            } else {
                db[args[0]] = undefined;
            }
            await this.writeDB(db);
            let o = {}
            o[args[0]] = db[args[0]];
            return discordMessage.channel.send(`\`\`\`json\n${ JSON.stringify(o) }\n\`\`\``)
        });

        bot.onCommand(this.COMMAND_OBJ, async (messageString, discordMessage) => {
            let db;
            try {
                db = JSON.parse(messageString);
            } catch (err) {
                db = {};
                return discordMessage.channel.send('Invalid input')
            }
            await this.writeDB(db);
            return discordMessage.channel.send(`\`\`\`json\n${JSON.stringify(db, null, 4)}\`\`\``)
        });
            
        this.client = client;
    }

    get db_channel() {
        return this.client.channels.find(channel => channel.name === this.DB_CHANNEL_NAME);
    }

    async dbMessage() {
        let channel = this.db_channel;
        if (channel === null) console.log(`Channel ${this.DB_CHANNEL_NAME} not found.`)
        else {
            try {
                return await channel.fetchMessage(channel.lastMessageID);
            } catch (err) {
                throw new Error("Cannot get last message.")
            }
        }
    }

    async getDB() {
        let message;
        try {
            message = await this.dbMessage();
            return JSON.parse(/```json\s+?(.*)```/ms.exec(message.content)[1]);
        } catch (err) {
            return {}
        }
    }

    async writeDB(newObject) {
        let message, msgStr;
        try {
            message = await this.dbMessage();
            msgStr = '```json\n' + JSON.stringify(newObject, null, 4) + '```';
        } catch (err) {
            msgStr = '```json\n' + JSON.stringify(newObject, null, 4) + '```';
            return await this.db_channel.send(msgStr)
        }
        
        if (message.author.id === this.client.user.id) { // This bot sent the message and can edit it
            return await message.edit(msgStr)
        } else { // Send new message that this bot can edit
            return await this.db_channel.send(msgStr)
        }
    }

    help() {
        return [`!**${this.COMMAND} key=value** to set a value in the database.`,
                `!**${this.COMMAND_OBJ} json_obj** where json_obj will replace current object.`]
    }
}