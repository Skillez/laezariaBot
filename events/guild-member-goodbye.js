const { bot, Discord, sendEmbedLog, embedColors, LaezariaIconURL } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                         NEW GUILD MEMBER GOODBYE MESSAGE HANDLER                         //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('guildMemberRemove', member => {

    // define the embed: missing goodbye channel
    let embed_goodbye_missing_channel = new Discord.MessageEmbed()
        .setColor(embedColors.GuildMemberEvent)
        .setAuthor('guild-member-goodbye.js - ERROR', LaezariaIconURL)
        .setTitle(`Guild Member Goodbye - Handler`)
        // .setDescription(`Guild Name: ${member.guild.name}`)
        .addFields({ name: 'Reason', value: `I cannot locate the goodbye channel`, inline: false })
        .setFooter(`LOG:ID GuildMemberGoodbyeJS_1`)
        .setThumbnail(LaezariaIconURL)
        .setTimestamp()

    // define the embed: goodbye on the wrong server
    let embed_goodbye_wrong_guild = new Discord.MessageEmbed()
        .setColor(embedColors.GuildMemberEvent)
        .setAuthor('guild-member-goodbye.js - WARNING', LaezariaIconURL)
        .setTitle(`Guild Member Goodbye - Handler`)
        // .setDescription(`Guild Name: ${member.guild.name}`)
        .addFields({ name: 'Reason', value: `${member.user.tag} has left but on different guild`, inline: false })
        .setFooter(`LOG:ID GuildMemberGoodbyeJS_2`)
        .setThumbnail(LaezariaIconURL)
        .setTimestamp()

    if (member.guild.id != config.LaezariaServerID) { // IF A MEMBER HAS LEFT BUT ON DIFFERENT SERVER THAN THE DEFINED GUILD
        return sendEmbedLog(embed_goodbye_missing_channel, config.BotLogChannelID, 'Laezaria Bot - Logs');
    }
    else { // IF MEMBER HAS LEFT CORRECT GUILD

        let GoodbyeChannel = member.guild.channels.cache.find(ch => ch.id === config.GoodbyeChannelID);
        if (!GoodbyeChannel) return sendEmbedLog(embed_goodbye_missing_channel, config.BotLogChannelID, 'Laezaria Bot - Logs');

        // define the embed: missing send_messages
        let embed_goodbye_missing_send_messages = new Discord.MessageEmbed()
            .setColor(embedColors.GuildMemberEvent)
            .setAuthor('guild-member-goodbye.js - ERROR', LaezariaIconURL)
            .setTitle(`Guild Member Goodbye - Handler`)
            // .setDescription(`Guild Name: ${member.guild.name}`)
            .addFields({ name: 'Reason', value: `I cannot send messages in ${GoodbyeChannel}`, inline: false })
            .setFooter(`LOG:ID GuildMemberGoodbyeJS_3`)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()

        GoodbyeChannel.send(`**${member.user.tag}** just left Laezaria <:laezaria:582281105298817032>. Bye bye ${member.user.tag}... <a:PepoSadLove:537247598239809536>`)
            .then(async message => {
                if (!message.content) return; // if message.content is empty aka missing send_messages

                message.react("420548091347730432")
                    .catch(error => {
                        // define the embed: missing goodbye reaction
                        let embed_goodbye_missing_emoji = new Discord.MessageEmbed()
                            .setColor(embedColors.GuildMemberEvent)
                            .setAuthor('guild-member-goodbye.js - WARNING', LaezariaIconURL)
                            .setTitle(`Guild Member Goodbye - Handler`)
                            // .setDescription(`Guild Name: ${member.guild.name}`)
                            .addFields({ name: 'Reason', value: `${error.message}`, inline: false })
                            .setFooter(`LOG:ID GuildMemberGoodbyeJS_4`)
                            .setThumbnail(LaezariaIconURL)
                            .setTimestamp()
                        return sendEmbedLog(embed_goodbye_missing_emoji, config.BotLogChannelID, 'Laezaria Bot - Logs');
                    });
            })
            .catch(() => {
                return sendEmbedLog(embed_goodbye_missing_send_messages, config.BotLogChannelID, 'Laezaria Bot - Logs');
            })
    }
});