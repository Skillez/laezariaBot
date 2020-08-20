const { Discord, sendEmbedLog, embedColors, LaezariaIconURL, errorLog } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "dm",
    description: "Sends a direct message through the bot.",
    type: "captain",
    usage: `ℹ️ Format: **${config.BotPrefix}dm userID/mention messageToSend**\n\nℹ️ Examples:\n${config.BotPrefix}dm ${config.BotOwnerID} Hello 👋\n${config.BotPrefix}dm @mention Hello 👋`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                 dm user/mention content                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0]) { 

        let user2dm = message.mentions.users.first() || args[0];
        let message2dm = message.content.split(' ').splice(2).join(' ');

        if (user2dm && message2dm) {
            return SendTheDirectMessage(user2dm, message2dm);
        } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
    } return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function SendTheDirectMessage(A1, A2) {
        // console.log(`SendTheDirectMessage Triggered!\nA1: ${A1}\nA2: ${A2}\n--------------------------------`);

        let ReplaceMentionToID = A1.toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
        // console.log(`TEST: ${ReplaceMentionToID}`)

        // let mention = bot.users.cache.get(ReplaceMentionToID);
        let mention = message.guild.member(ReplaceMentionToID);

        if (!mention) { // If user is not found on the server
            return message.channel.send(`Unfortunately, but I can't find the user you tried to message.\nMake sure user is still on the server!`)
                .then(message => { message.delete({ timeout: 10000 }).catch(() => { return; }) }).catch(console.error);
        }

        // If user to send a direct message is found
        // console.log(`SendTheDirectMessage: @mention is found!`);

        // define the embed: dm success log
        let embed_dm_success_log = new Discord.MessageEmbed()
            .setColor(embedColors.DirectMessage)
            .setAuthor(`Direct Message sent correctly!`, LaezariaIconURL)
            .setDescription(`Message:\n` + '```' + `${A2}` + '```')
            .addFields(
                { name: `Used by`, value: message.author, inline: true },
                { name: 'Channel', value: message.channel, inline: true },
                { name: `Receiver Information`, value: `${mention}\n${mention.displayName}\n${mention.user.tag}\nID: ${mention.id}`, inline: false })
            .setFooter(`LOG:ID dmJS_1`)
            .setThumbnail(mention.user.avatarURL())
            .setTimestamp()

        mention.send(A2).then(() => { // SEND THE MESSAGE TO THE USER
            message.channel.send(`✅ Done!\nDirect message sent to **${mention.user.tag}**`)
                .then(message => {
                    sendEmbedLog(embed_dm_success_log, config.BotDirectMessageChannelID, 'Laezaria Bot - Direct Messages');
                    message.delete({ timeout: 5000 }).catch(() => { return })
                });
        }).catch(error => { // IF MESSAGE CANNOT BE DELIEVERED
            if (error.message === "Cannot send messages to this user") {
                return message.channel.send(`❌ User **${mention.user.tag}** has DMs disabled!`)
                    .then(message => { message.delete({ timeout: 6000 }).catch(() => { return; }) });
            }

            return message.channel.send(`❌ Unknown error occurred!\n`, error)
                .then(message => {
                    message.delete({ timeout: 6000 }).catch(() => { return; });
                    errorLog(`dm.js:1 SendTheDirectMessage()\nError to send a DM.`, error);
                });
        });
    }
}