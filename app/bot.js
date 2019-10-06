/*
  Require statements
*/
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const fileExists = require('file-exists');

let LOGIN_TOKEN,
  BOT_OWNER,

  moduleSettings,
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

function initModules() {
  try {
    moduleSettings = jsonfile.readFileSync(modulesFilePath);
  } catch (err) {
    moduleSettings = [
      {
        moduleName: "HelpModule"
      },
      {
        moduleName: "HelloWorldModule"
      }
    ];
    jsonfile.writeFileSync(modulesFilePath, moduleSettings, { spaces: 2 });
    return false;
  }
  for (let moduleSetting of moduleSettings) {
    let moduleClass = requireModule(moduleSetting.moduleName);
    modules.set(moduleSetting.moduleName, new moduleClass(moduleSetting.settings === undefined ? {} : moduleSetting.settings, modules, client, settings));
  }
  return true;
}

function initSettings() {
  try {
    settings = jsonfile.readFileSync(settingsFilePath);
  } catch (err) {
    settings = {
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    };
    //jsonfile.writeFileSync(settingsFilePath, settings, { spaces: 2 });
    return true;
  }
  return true;
}

let settingsInit = initSettings();
let modulesInit = initModules();
if (!modulesInit || !settingsInit) process.exit();

class Bot {

  constructor(botModulesStringArray) {
    this.botModulesStringArray = botModulesStringArray;

    this.onCommandsListeners = new Map();
    this.onMessageListeners = [];
    this.onReadyListeners = [];
  }

  onCommand(keyword, func) {
    this.onCommandsListeners.set(keyword.toLowerCase(), func);
  }

  onMessage(func) {
    this.onMessageListeners.push(func);
  }

  onReady(func) {
    this.onReadyListeners.push(func);
  }

  /*
    THE SETUP FUNCTION, RUNS ON BOT STARTUP
  */
  async start() {
    let instance = this;

    LOGIN_TOKEN = settings.DISCORD_BOT_TOKEN;

    modules.forEach(currentModule => currentModule.register(instance));

    client.on('ready', () => {
      console.log(`Bot logged in as ${client.user.tag}!`);
      for (let listener of this.onReadyListeners) listener(client);
    });

    client.on('message', message => {

      for (let listener of this.onMessageListeners) listener(message);

      // Check if command
      if (message.content.charAt(0) !== "!") return; // Only messages starting with ! will be processed below this line
      // Parse command
      let msgArgs = message.content.split(" "); // An array of all user arguments including the command
      let cmd = msgArgs[0].substring(1); // Only the command without the "!"
      let tmpArr = message.content.split(/ (.+)/s);
      let msgTxt;
      if (tmpArr.length > 1) msgTxt = tmpArr[1]; // All the users text (not including command)
      else msgTxt = "";

      let func = this.onCommandsListeners.get(cmd.toLowerCase());
      if (func) func(msgTxt, message);
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
