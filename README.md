# kiwi

A discord bot.

## Commands

!**help** prints out a help page.

!**hello** Responds with `Hello world!`.

!**r expr** Responds with a rendered version of expr using http://asciimath.org/.

## Installation

Run container in current console window.
```
docker run -it --rm -e "DISCORD_BOT_TOKEN=yourtokenhere" froadus/kiwi-discord
```

Run container in detatched mode and always restart the container if it stops. If it is manually stopped, it is restarted only when Docker daemon restarts or the container itself is manually restarted.
```
docker run -d --restart always -e "DISCORD_BOT_TOKEN=yourtokenhere" froadus/kiwi-discord
```

Register your bot at https://discordapp.com/developers/applications/.
