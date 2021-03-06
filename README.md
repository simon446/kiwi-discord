# kiwi

A modular discord bot.

## Commands

 !**help** prints out a help page. 

!**hello** Responds with `Hello world!`. 

!**db key=value** to set a value in the database. 

!**db-json json_obj** where json_obj will replace current object. 

**any message** Responds with 🎉 with a probability of 0.01% 

!**r expr** Responds with a rendered version of expr using http://asciimath.org/. 

## Installation using docker

Run container in current console window.

```
docker run -it --rm -e "DISCORD_BOT_TOKEN=yourtokenhere" froadus/kiwi-discord
```

Run container in detatched mode and always restart the container if it stops. If it is manually stopped, it is restarted only when Docker daemon restarts or the container itself is manually restarted.

```
docker run -d --restart always -e "DISCORD_BOT_TOKEN=yourtokenhere" froadus/kiwi-discord
```

Register your bot at https://discordapp.com/developers/applications/.

# Development

## Getting started

1. Clone the git repo.
2. Install [Node.js](https://nodejs.org/en/) version > 12.12.0.
3. Type `npm install` in `app` dir. This will install required dependencies.
4. Create a new file `app/settings.json` and paste the following

   ```json
   {
      "DISCORD_BOT_TOKEN": "paste your token for development bot here"
   }
   ```
   
   NOTE: `settings.json` will not be commited to this repository.

5. Start the bot by typing `node bot.js` in `app` dir.

## Write your own module (Hello World example)

Modules can be stored in three ways:

1. Single file module in `app/modules` directory. For example: `app/modules/somemodule.js`.
2. Alternatively, this file can be renamed `index.js` and be placed in a subdirectory called `somemodule`. For example `app/modules/somemodule/index.js` points to the same file as above.
3. **(Deprecated)** Lastly, a module (stored as in alt. 2) can be published to npm. Then it can be installed with `npm i somemodule`. Notice that with this method this module will not be visible in the `modules` directory as it is installed in the `node_modules` directory instead.

A file named `HelloWorldModule.js` is the module in this example:

```javascript
module.exports = class HelloWorldModule {

    ready(bot, client) {
        bot.onCommand(this.COMMAND, (textMessage, discordMessage) => {
            discordMessage.channel.send(this.TEXT);
        });
    }

    help() {
        return [`!**${this.COMMAND}** Responds with \`${this.TEXT}\`.`];
    }

}
```

Your `modules.json` should look like this:

```json
[
  {
    "NAME": "HelloWorldModule",
    "COMMAND": "hello",
    "TEXT": "Hello world!"
  }
]

```
