const { Discord, embedColors, LaezariaIconURL, errorLog } = require('../laezariaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "say",
    description: "Sends a message as the bot.",
    type: "captain",
    usage: `ℹ️ Format: **${config.botPrefix}say #channel(optional) embed(optional) messageToSend**\n\nℹ️ Examples:\n${config.botPrefix}say Hello 👋\n${config.botPrefix}say embed Hello 👋\n${config.botPrefix}say <#${config.channels.welcomeChannelID}> Hello 👋\n${config.botPrefix}say <#${config.channels.welcomeChannelID}> embed Hello 👋`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                             say content or say embed content                             //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0]) return BotSayTheMessage(args[0], args[1], args[2]); // Run function to send the message as a bot user
    else return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function BotSayTheMessage(A1, A2, A3) {
        let replaceMentionToID = A1.toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
        let mentionedChannel = bot.channels.cache.get(replaceMentionToID);

        if (mentionedChannel) {
            if (!A2) return message.channel.send(`You forgot to type the text to send!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            if (A2.toLowerCase() === "embed") {
                if (!A3) return message.channel.send(`You forgot to type the text to send!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

                // define the embed: send embed message on the target channel
                let embed_say = new Discord.MessageEmbed()
                    .setColor(embedColors.SayMessage)
                    .setAuthor('Laezaria', LaezariaIconURL)
                    .setDescription(args.slice(2).join(" "))
                    .setTimestamp()
                    .setFooter(`Sent by ${message.author.tag}`)
                mentionedChannel.send(embed_say);
            } else return mentionedChannel.send(args.slice(1).join(" "));

        } else {
            if (A1.toLowerCase() === "embed") {
                if (!A2) return message.channel.send(`You forgot to type the text to send!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

                // define the embed: send embed message
                let embed_say = new Discord.MessageEmbed()
                    .setColor(embedColors.SayMessage)
                    .setAuthor('Laezaria', LaezariaIconURL)
                    .setDescription(args.slice(1).join(" "))
                    .setTimestamp()
                    .setFooter(`Sent by ${message.author.tag}`)
                message.channel.send(embed_say);
            } else return message.channel.send(args.join(" "));
        }
    }
}