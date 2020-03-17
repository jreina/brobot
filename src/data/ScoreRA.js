const Redis = require("ioredis");

class ScoreRA {
  constructor() {
    this.redis = new Redis();
  }
  incrementScoreForUser(term, user, guildId) {
    const key = `guild=${guildId}:term=${term}:scores`;
    return this.redis.hincrby(key, user, 1);
  }
  getScoresForTerm(term, guildId) {
    const key = `guild=${guildId}:term=${term}:scores`;
    return this.redis.hgetall(key)
  }
  clearScoreForTerm(term, guildId) {
    const key = `guild=${guildId}:term=${term}:scores`;
    return this.redis.del(key)
  }
}

module.exports = new ScoreRA();
