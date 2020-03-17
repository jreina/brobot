const TermRA = require("./data/TermRA");
const ScoreRA = require("./data/ScoreRA");
const helpText = require("./helpText");
const processTerms = require("./processTerms");
const redos = require("redos");

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

      switch (command) {
        case "addterm":
          const existingTerm = (
            await TermRA.getTerms(message.channel.guild.id)
          ).find(term => term.term === text);
          if (existingTerm) {
            return message.channel.send(
              `Term "${text}" is already registered with brobot!`
            );
          }
          await TermRA.addTerm(message.channel.guild.id, { term: text });
          return message.channel.send(`Term "${text}" registered with brobot`);
          break;
        case "addpattern":
          // https://stackoverflow.com/questions/17843691/javascript-regex-to-match-a-regex
          // Be afraid!
          const regexForRegex = /\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/;
          if (!regexForRegex.test(text)) {
            return message.channel.send(`Pattern ${text} isn't a valid regex!`);
          }
          if (!redos(text).results()[0].safe) {
            return message.channel.send(
              `Pattern \`${text}\` is evil and must be destroyed. Do not fuck with me.`
            );
          }
          const existingPattern = (
            await TermRA.getTerms(message.channel.guild.id)
          ).find(term => term.pattern === text);
          if (existingPattern) {
            return message.channel.send(
              `Pattern /${text}/ is already registered with brobot!`
            );
          }
          if (!label)
            return message.channel.send(
              "Must provide a label when registering a pattern! Send `@brobot help` for full usage instructions."
            );
          await TermRA.addTerm(message.channel.guild.id, {
            pattern: text,
            label
          });
          return message.channel.send(
            `Pattern ${text} has been registered with brobot as "${label}"`
          );
          break;
        case "listterms":
          const results = await TermRA.getTerms(message.channel.guild.id);
          if (results.length === 0) {
            return message.channel.send(`No patterns or terms registered!`);
          }
          const termList = results
            .map(result =>
              result.term
                ? `term: ${result.term}`
                : `pattern: ${result.label} \`${result.pattern}\``
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
          await ScoreRA.clearScoreForTerm(text, message.channel.guild.id);
          return message.channel.send(`Data purged for term labeled ${text}`);
          break;
        case "dropterm":
          if (!text) {
            return message.channel.send("Please provide a term to drop!");
          }
          await TermRA.dropTerm(message.channel.guild.id, text);
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
