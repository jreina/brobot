const { config } = require("dotenv");
if (!process.env.BOT_TOKEN || !process.env.REDIS_HOST) config();
if (!process.env.BOT_TOKEN || !process.env.REDIS_HOST) throw new Error("BOT_TOKEN or REDIS_HOST env variable not set");

module.exports = {
  botToken: process.env.BOT_TOKEN,
  redis: {
    host: process.env.REDIS_HOST
  }
};
