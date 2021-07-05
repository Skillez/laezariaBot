const config = require("../bot-settings.json");
const fs = require('fs');
const { embedMessage, errorLog } = require("../laezariaBot");

module.exports.help = {
    name: "rank",
    description: "Checks your or others current ranking and points.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}rank @mention/userID(optional)**\n\nℹ️ Examples:\n${config.botPrefix}rank - for own ranking\n${config.botPrefix}rank @Skillez\n${config.botPrefix}rank ${config.botOwnerID}`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                   rank @mention add/del                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (!args.length) return checkPoints(message.author);

    // Check the points for people: !rank @mention/userID
    if (args[0]) {
        const ReplaceMentionToID = args[0].toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
        const mentionedUser = await bot.users.cache.get(ReplaceMentionToID);

        if (!mentionedUser) return message.channel.send(embedMessage(`This user is not found as a member of ${message.guild.name}!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        return checkPoints(mentionedUser);
    }

    // If command format is wrong
    return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    /////////////////////////////////////////////////////////////////////////////////////////

    function checkPoints(user) {

        // Load points_current.json file and parse it to javascript object
        try {
            const fileContent = fs.readFileSync("./points_system/points_current.json", "utf8");
            var leaderboardObject = JSON.parse(fileContent);
        } catch (error) {
            message.channel.send(embedMessage(`Error to load leaderboard data file!`, message.author))
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
            return errorLog(`rank.js:1 checkPoints()\nError to LOAD/PARSE 'points_current.json' data file.`, error)
        }

        // Load ${user.id}.json file and parse it to javascript object
        try {
            var fileUserContent = fs.readFileSync(`./points_system/current_season/${user.id}.json`, "utf8");
        } catch (error) {
            if (error.message.includes('ENOENT: no such file or directory, open')) {
                return message.channel.send(embedMessage(`${user} doesn't have any points yet!`, message.author))
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
            } else return errorLog(`rank.js:2 checkPoints()\nError to LOAD '${user.id}.json' data file.`, error);
        }

        try {
            var userObject = JSON.parse(fileUserContent);
        } catch (error) {
            message.channel.send(embedMessage(`Error to parse ${user} data file!`, message.author))
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
            return errorLog(`rank.js:3 checkPoints()\nError to PARSE '${user.id}.json' data file.`, error);
        }

        // Define rankingString with an index number +1 or NONE.
        let rankingString = '';
        if (!leaderboardObject.find(u => u.id === user.id)) rankingString = 'NONE';
        else rankingString = `${leaderboardObject.findIndex(element => element.id === user.id) + 1}`;

        // Find the leaz emoji
        let laezEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'laezaria');
        if (!laezEmoji) laezEmoji = '';

        if (rankingString === 'NONE') return message.channel.send(embedMessage(`${user} no ranking yet.\n${laezEmoji} **${userObject.points.toLocaleString()}** Laezaria Points!\n\n> Ranking updates daily at 10:30 AM UTC!`, message.author))
            .then(message => message.delete({ timeout: 60000 })).catch(() => { return });
        else return message.channel.send(embedMessage(`${user} ranking **${rankingString}** out of ${leaderboardObject.length}.\n${laezEmoji} **${userObject.points.toLocaleString()}** Laezaria Points!\n\n> Ranking updates daily at 10:30 AM UTC!`, message.author))
            .then(message => message.delete({ timeout: 60000 })).catch(() => { return });

    }
}