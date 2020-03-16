const { Database } = require("@johnny.reina/json-db");
const helpText = require("./helpText");
const processTerms = require("./processTerms");

module.exports = botId =>
  async function messageHandler(message) {
    if (
      message.mentions &&
      message.mentions.users.has(botId) &&
      message.content.includes("help")
    ) {
      // it me
      message.channel.send(helpText);
    }
    if (message.content.startsWith("!")) {
      const [command, text, label] = message.content
        .replace("!", "")
        .split(" ");
      const terms = new Database("brobot").collection(
        `terms.${message.channel.guild.id}`
      );

      switch (command) {
        case "addterm":
          const existingTerm = await terms.find(term => term.term === text);
          if (existingTerm) {
            return message.channel.send(
              `Term "${text}" is already registered with brobot!`
            );
          }
          await terms.insert({ term: text });
          return message.channel.send(`Term "${text}" registered with brobot`);
          break;
        case "addpattern":
          const existingPattern = await terms.find(
            term => term.pattern === text
          );
          if (existingPattern) {
            return message.channel.send(
              `Pattern /${text}/ is already registered with brobot!`
            );
          }
          if (!label)
            return message.channel.send(
              "Must provide a label when registering a pattern! Send `@brobot help` for full usage instructions."
            );
          await terms.insert({ pattern: text, label });
          return message.channel.send(
            `Pattern \`/${text}/\` has been registered with brobot as "${label}"`
          );
          break;
        case "listterms":
          const results = await terms.read();
          if (results.length === 0) {
            return message.channel.send(`No patterns or terms registered!`);
          }
          const termList = results
            .map(result =>
              result.term
                ? `term: ${result.term}`
                : `pattern: ${result.label} \`/${result.pattern}/\``
            )
            .join("\n");

          const response = `Here are the terms registered with brobot on this guild:\n${termList}`;
          return message.channel.send(response);
          break;
        case "purge":
          if (!text) {
            return message.channel.send(
              "Please provide a term to purge data for!"
            );
          }
          const coll = new Database("brobot").collection(
            `scores.${message.channel.guild.id}`
          );
          await coll.delete(item => item.name === text);
          return message.channel.send(`Data purged for term labeled ${text}`);
          break;
        case "dropterm":
          if (!text) {
            return message.channel.send(
              "Please provide a term to drop!"
            );
          }
          await terms.delete(item => item.term === text || item.label === text);
          return message.channel.send(`Dropped term labeled ${text}`);
          break;
      }
    }

    if (message.author.id !== botId) {
      await processTerms(
        message.author.username,
        message.content,
        message.channel.guild.id,
        scoreboard => message.channel.send(scoreboard)
      );
    }
  };
