const config = require("../bot-settings.json");
const fs = require('fs');
const { embedMessage } = require("../app");

module.exports.help = {
    name: "rank",
    description: "Checks your or others current ranking and points.",
    type: "public",
    usage: `ℹ️ Format: **${config.BotPrefix}rank @mention/userID(optional)**\n\nℹ️ Examples:\n${config.BotPrefix}rank - for own ranking\n${config.BotPrefix}rank @Skillez\n${config.BotPrefix}rank ${config.BotOwnerID}`
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
    return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    /////////////////////////////////////////////////////////////////////////////////////////

    function checkPoints(user) {

        // Load points_current.json file and parse it to javascript object
        const pointsJSON = fs.readFileSync("./points_current.json", "utf8");
        const points = JSON.parse(pointsJSON);

        // User is not in the database
        if (!points.find(u => u.id === user.id)) return message.channel.send(embedMessage(`${user} doesn't have any points yet!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        // Sort the points by its values (from the highest to lowest)
        points.sort(function (a, b) {
            return b.points - a.points;
        });

        // Find the leaz emoji
        let laezEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'laezaria');
        if (!laezEmoji) laezEmoji = '';

        // Get user index number from the sorted database
        const userRank = points.findIndex(element => element.id === user.id) + 1;

        // User is already in the database
        if (points.find(u => u.id === user.id)) message.channel.send(embedMessage(`${user} ranking: **${userRank}** out of ${points.length} people.\n${laezEmoji} **${points.find(u => u.id === user.id).points.toLocaleString()}** Laezaria Points!`, message.author))
            .then(message => message.delete({ timeout: 60000 })).catch(() => { return });
    }
}