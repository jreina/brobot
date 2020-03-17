const ScoreRA = require("./data/ScoreRA");
const TermRA = require("./data/TermRA");

async function buildScoreboard(name, guildId) {
  const termScore = await ScoreRA.getScoresForTerm(name, guildId);
  if (!termScore) {
    return `No score data for ${name}`;
  } else {
    const scores = Object.entries(termScore)
      .sort(([, a], [, b]) => (+a > +b ? -1 : +a < +b ? 1 : 0))
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
  const terms = await TermRA.getTerms(guildId);
  const matchedTerms = terms
    .filter(term =>
      term.term ? text.includes(term.term) : getAsRegex(term.pattern).test(text)
    )
    .map(term => (term.term ? term.term : term.label));

  for (const term of matchedTerms) {
    await ScoreRA.incrementScoreForUser(term, user, guildId);
    cb(await buildScoreboard(term, guildId));
  }
};
