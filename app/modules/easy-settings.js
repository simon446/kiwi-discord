function forEachObj(obj, callback) {
    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) continue;
        callback(prop, obj[prop]);
    }
}

module.exports = class EasySettings {
    async preload(bot, client) {
        let db = bot.modules.get('discord-db');

        let data = await db.getDB();
        let moduleSettings = data['modules'];
        if (moduleSettings === undefined) return;

        if (moduleSettings instanceof Array) {
            for (let moduleSetting of moduleSettings) {
                try {
                    if (moduleSetting['NAME'] !== undefined) {
                        let module = bot.modules.get(moduleSetting['NAME']);
                        if (module !== undefined) {
                            forEachObj(moduleSetting, (key, val) => {
                                module[key] = val;
                            });
                        }
                    }
                } catch (err) {console.log(err)}
            }
        } else console.log("WARN: Wrong module format in db.");
    }

    ready(bot, client) {
        bot.onCommand(this.RESTART_COMMAND, () => {
            client.destroy()
        })
    }

    help() {
        return [`!**${this.RESTART_COMMAND}** restarts bot`]
    }
}
