module.exports = `brobot
Commands:
\`@brobot help\` prints this help text
\`!addterm <term>\` adds a plain-text term to the watch list
\`!addpattern <pattern> <label>\` adds a RegEx pattern to the watch list with the given label
\`!dropterm <term|label>\` stop watching for a term or pattern label
\`!listterms\` lists out all the terms and patterns being watched
\`!purge <term|label>\` purges leaderboard data for the given term or label
`;
