const { Discord, LaezariaIconURL, errorLog } = require('../laezariaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "vote",
    description: "Starts a simple yea/nah/dont know vote.",
    type: "captain",
    usage: `ℹ️ Format: **${config.botPrefix}vote your question**\n\nℹ️ Example: ${config.botPrefix}vote LaezBot is the best?`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                        vote question                                     //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0]) return StartVoteMessage(args);
    else return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function StartVoteMessage(args) {
        // define the embed: send embed vote message
        let embed_vote = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setAuthor('Laezaria Vote', LaezariaIconURL)
            // .setDescription("```" + args.join(" ") + "```")
            .setDescription(args.join(" "))
            .setTimestamp()
            .setFooter(`Started by ${message.author.tag}`)
        message.channel.send(embed_vote).then(message => { AddVoteEmojis(message) });
    }

    async function AddVoteEmojis(message) {
        try {
            await message.react('244162428089270273'); // ☑️
            await message.react(`244162428382871563`); // 🇽
            await message.react('645259905837563911'); // 🤷 🤷‍♂️
        } catch (error) { errorLog(`vote.js:1 AddVoteEmojis()\nError to add emojis probably missing ADD_REACTIONS.`, error) }
    }
}