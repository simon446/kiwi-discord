/*
  Require statements
*/
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const fileExists = require('file-exists');

const KEY_FORMAT = /^[A-Z_]*$/;
const SECRET_VAL_FORMAT = /^{([A-Z_]+)}$/;

let LOGIN_TOKEN,
  moduleSettings,
  moduleSettingsMap = new Map(),
  modules = new Map(),
  modulePath = './modules',

  settings;

let client = new Discord.Client();


let modulesFilePath = 'modules.json';
let settingsFilePath  = 'settings.json';
let entryFileName = 'index.js';

function requireModule(moduleName) {
  let path = modulePath + '/' + moduleName;

  if (fileExists.sync(path + '.js')) return require(path);
  if (fileExists.sync(path + '/' + entryFileName)) return require(path + '/' + entryFileName);
  return require(moduleName);
}

function forEachObj(obj, callback) {
  for (var prop in obj) {
      if (!obj.hasOwnProperty(prop)) continue;
      callback(prop, obj[prop]);
  }
}

function initModules() {
  try {
    moduleSettings = jsonfile.readFileSync(modulesFilePath);
  } catch (err) {
    moduleSettings = [];
    jsonfile.writeFileSync(modulesFilePath, moduleSettings, { spaces: 2 });
    return false;
  }

  for (let moduleSetting of moduleSettings) {
    let Module = requireModule(moduleSetting['NAME']);
    let module = new Module();

    forEachObj(moduleSetting, (key, val) => {
      let match = SECRET_VAL_FORMAT.exec(val);
      if (match) {
        module[key] = process.env[match[1]];
        if (module[match[1]] === undefined) {
          module[key] = settings[match[1]]
          if (module[key] === undefined) throw new Error(`Secret key "${val}" in ${modulesFilePath} was not found.`)
        }
      } else if (key.match(KEY_FORMAT)) {
        module[key] = val
      } else throw new Error(`Module settings error: key "${key}" in ${modulesFilePath} does not match required key format ${KEY_FORMAT}`);
    });

    modules.set(moduleSetting['NAME'], module);
  }
  return true;
}

function initSettings() {
  try {
    settings = jsonfile.readFileSync(settingsFilePath);
  } catch (err) {
    settings = {};
    //jsonfile.writeFileSync(settingsFilePath, settings, { spaces: 2 });
    return true;
  }
  return true;
}

let settingsInit = initSettings();
let modulesInit = initModules();
if (!modulesInit || !settingsInit) process.exit();

class Bot {

  constructor() {
    this.onCommandsListeners = new Map();
    this.onMessageListeners = [];
    this.onReadyListeners = [];
    this.onReadyPreloadListeners = [];
    this.modules = modules;
  }

  onCommand(keyword, func) {
    this.onCommandsListeners.set(keyword.toLowerCase(), func);
  }

  onMessage(func) {
    this.onMessageListeners.push(func);
  }

  get isProduction() {
    return process.argv[2] === '--production';
  }

  isValidModuleKey(key) {
    return key.match(KEY_FORMAT) !== null;
  }

  /*
    THE SETUP FUNCTION, RUNS ON BOT STARTUP
  */
  async start() {
    let instance = this;

    LOGIN_TOKEN =  settings.DISCORD_BOT_TOKEN === undefined ? process.env.DISCORD_BOT_TOKEN : settings.DISCORD_BOT_TOKEN;

    if (LOGIN_TOKEN === undefined) throw new Error(`DISCORD_BOT_TOKEN was not found.`)

    client.on('ready', async () => {
      let moduleArr = Array.from(modules);

      // Run preload
      for (let e of moduleArr) {
        const currentModule = e[1];
        if (currentModule.preload !== undefined) {
          if (currentModule.preload.constructor.name === "AsyncFunction") {
            await currentModule.preload(instance, client)
          } else {
            currentModule.preload(instance, client)
          }
        }
      }
      
      // Run ready
      for (let e of moduleArr) {
        const currentModule = e[1];
        if (currentModule.ready !== undefined) {
          if (currentModule.ready.constructor.name === "AsyncFunction") {
            await currentModule.ready(instance, client)
          } else {
            currentModule.ready(instance, client)
          }
        }
      }

      console.log(`Bot logged in as ${client.user.tag}!`);
      console.log(`All bot modules have been loaded!`);

    });

    client.on('message', message => {
      for (let onMessage of this.onMessageListeners) onMessage(message);

      // Check if command
      if (message.content.charAt(0) !== "!") return; // Only messages starting with ! will be processed below this line
      // Parse command
      let msgArgs = message.content.split(" "); // An array of all user arguments including the command
      let cmd = msgArgs[0].substring(1); // Only the command without the "!"
      let tmpArr = message.content.split(/ (.+)/s);
      let msgTxt;
      if (tmpArr.length > 1) msgTxt = tmpArr[1]; // All the users text (not including command)
      else msgTxt = "";

      let onCommand = this.onCommandsListeners.get(cmd.toLowerCase());
      if (onCommand) onCommand(msgTxt, message);
    });

    client.login(LOGIN_TOKEN);
  }

  async stop() {
    let instance = this;
    this.onCommandsListeners = [];
    this.onMessageListeners = [];
    client.destroy()
    .then(() => {console.log("Bot has been stopped!")})
    .catch(console.error);
  }
}

let bot = new Bot();

bot.start();
