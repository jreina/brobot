const { Database } = require("@johnny.reina/json-db");

async function incrementScoreForUser(term, user, guildId) {
  const coll = new Database("brobot").collection(
    `scores.${guildId}`
  );
  const termScore = await coll.find(item => item.name === term);
  if (!termScore) {
    await coll.insert({
      name: term,
      scores: {
        [user]: 1
      }
    });
  } else {
    termScore.scores[user]++;
    await coll.update(termScore);
  }
}

async function buildScoreboard(name, guildId) {
  const coll = new Database("brobot").collection(
    `scores.${guildId}`
  );
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

/**
 * @param {string} user
 * @param {string} text
 * @param {string} guildId
 */
module.exports = async function processTerms(user, text, guildId, cb) {
  const coll = new Database("brobot").collection(
    `terms.${guildId}`
  );
  const terms = await coll.read();
  const matchedTerms = terms
    .filter(term =>
      term.term ? text.includes(term.term) : new RegExp(term.pattern).test(text)
    )
    .map(term => (term.term ? term.term : term.label));

  for (const term of matchedTerms) {
    await incrementScoreForUser(term, user, guildId);
    cb(await buildScoreboard(term, guildId));
  }
};
