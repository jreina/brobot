const Discord = require("discord.js");
const logger = console;
const auth = require("./auth");
const messageHandler = require("./messageHandler");

const bot = new Discord.Client();

bot.login(auth.botToken).then(_ => {
  bot.on("ready", function(evt) {
    logger.info("Connected");
    logger.info("Logged in as:", bot.user.tag, bot.user.id);
  });
  bot.on("message", messageHandler(bot.user.id));
});
