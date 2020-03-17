const Redis = require("ioredis");
const auth = require('../auth')

class TermRA {
  constructor() {
    this.redis = new Redis(auth.redis.host);
  }
  async getTerms(guildId) {
    const key = `guild=${guildId}:terms`;
    const terms = await this.redis.lrange(key, 0, -1);
    return terms.map(x => JSON.parse(x));
  }
  addTerm(guildId, term) {
    const key = `guild=${guildId}:terms`;
    return this.redis.lpush(key, JSON.stringify(term));
  }
  async dropTerm(guildId, term) {
    const key = `guild=${guildId}:terms`;
    const terms = await this.getTerms(guildId);
    const match = terms.find(item => item.term === term || item.label === term);
    return this.redis.lrem(key, 1, JSON.stringify(match));
  }
}

module.exports = new TermRA();
