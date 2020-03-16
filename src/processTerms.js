const { Database } = require("@johnny.reina/json-db");

async function incrementScoreForUser(term, user, guildId) {
  const coll = new Database("brobot").collection(`scores.${guildId}`);
  const termScore = await coll.find(item => item.name === term);
  if (!termScore) {
    await coll.insert({
      name: term,
      scores: {
        [user]: 1
      }
    });
  } else {
    if (!(user in termScore.scores)) termScore.scores[user] = 0;
    termScore.scores[user]++;
    await coll.update(termScore);
  }
}

async function buildScoreboard(name, guildId) {
  const coll = new Database("brobot").collection(`scores.${guildId}`);
  const termScore = await coll.find(item => item.name === name);
  if (!termScore) {
    return `No score data for ${name}`;
  } else {
    const scores = Object.entries(termScore.scores)
      .sort(([, a], [, b]) => (a > b ? -1 : a < b ? 1 : 0))
      .map(([user, score]) => `${user}\t\t->\t${score}`)
      .join("\n");

    return `Leaderboard for ${name}:\n${scores}`;
  }
}

function getAsRegex(text) {
  const getRegexString = text => {
    const bits = text.split("/");
    return bits.slice(1, bits.length - 1).join("/")
  };
  const regexString = getRegexString(text);

  const getFlags = text => {
    const segments = text.split("/");
    return segments[segments.length - 1];
  };
  const flags = getFlags(text);
  return flags.length
    ? new RegExp(regexString, flags)
    : new RegExp(regexString);
}
/**
 * @param {string} user
 * @param {string} text
 * @param {string} guildId
 */
module.exports = async function processTerms(user, text, guildId, cb) {
  const coll = new Database("brobot").collection(`terms.${guildId}`);
  const terms = await coll.read();
  const matchedTerms = terms
    .filter(term =>
      term.term ? text.includes(term.term) : getAsRegex(term.pattern).test(text)
    )
    .map(term => (term.term ? term.term : term.label));

  for (const term of matchedTerms) {
    await incrementScoreForUser(term, user, guildId);
    cb(await buildScoreboard(term, guildId));
  }
};
