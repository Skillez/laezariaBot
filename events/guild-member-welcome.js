const { bot, Discord, sendEmbedLog, embedColors, LaezariaIconURL } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                         NEW GUILD MEMBER WELCOME MESSAGE HANDLER                         //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('guildMemberAdd', member => {

    // define the embed: missing welcome channel
    let embed_welcome_missing_channel = new Discord.MessageEmbed()
        .setColor(embedColors.GuildMemberEvent)
        .setAuthor('guild-member-welcome.js - ERROR', LaezariaIconURL)
        .setTitle(`Guild Member Welcome - Handler`)
        // .setDescription(`Guild Name: ${member.guild.name}`)
        .addFields({ name: 'Reason', value: `I cannot locate the welcome channel`, inline: false })
        .setFooter(`LOG:ID GuildMemberWelcomeJS_1`)
        .setThumbnail(LaezariaIconURL)
        .setTimestamp()

    // define the embed: welcome on the wrong server
    let embed_welcome_wrong_guild = new Discord.MessageEmbed()
        .setColor(embedColors.GuildMemberEvent)
        .setAuthor('guild-member-welcome.js - WARNING', LaezariaIconURL)
        .setTitle(`Guild Member Welcome - Handler`)
        // .setDescription(`Guild Name: ${member.guild.name}`)
        .addFields({ name: 'Reason', value: `${member.tag} has joined, but in different guild`, inline: false })
        .setFooter(`LOG:ID GuildMemberWelcomeJS_2`)
        .setThumbnail(LaezariaIconURL)
        .setTimestamp()

    if (member.guild.id != config.LaezariaServerID) { // IF A MEMBER HAS LEFT BUT ON DIFFERENT SERVER THAN THE DEFINED GUILD
        return sendEmbedLog(embed_welcome_wrong_guild, config.BotLogChannelID, 'Laezaria Bot - Logs');
    }
    else { // IF MEMBER HAS LEFT CORRECT GUILD

        let WelcomeChannel = member.guild.channels.cache.find(ch => ch.id === config.WelcomeChannelID);
        if (!WelcomeChannel) return sendEmbedLog(embed_welcome_missing_channel, config.BotLogChannelID, 'Laezaria Bot - Logs');

        // define the embed: missing send_messages
        let embed_welcome_missing_send_messages = new Discord.MessageEmbed()
            .setColor(embedColors.GuildMemberEvent)
            .setAuthor('guild-member-welcome.js - ERROR', LaezariaIconURL)
            .setTitle(`Guild Member Welcome - Handler`)
            // .setDescription(`Guild Name: ${member.guild.name}`)
            .addFields({ name: 'Reason', value: `I cannot send messages in ${WelcomeChannel}`, inline: false })
            .setFooter(`LOG:ID GuildMemberWelcomeJS_3`)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()

        WelcomeChannel.send(`${member} - Welcome to **Laezaria** <:laezaria:582281105298817032>! Check out the <#${config.InformationChannelID}> channel. Enjoy your stay <a:pepegaShake:607545444670898177>`)
            .then(async message => {
                if (!message.content) return; // if message.content is empty aka missing send_messages

                message.react("627849802704486412")
                    .catch(error => {
                        // define the embed: missing welcome reaction
                        let embed_welcome_missing_emoji = new Discord.MessageEmbed()
                            .setColor(embedColors.GuildMemberEvent)
                            .setAuthor('guild-member-welcome.js - WARNING', LaezariaIconURL)
                            .setTitle(`Guild Member Welcome - Handler`)
                            // .setDescription(`Guild Name: ${member.guild.name}`)
                            .addFields({ name: 'Reason', value: `${error.message}`, inline: false })
                            .setFooter(`LOG:ID GuildMemberWelcomeJS_4`)
                            .setThumbnail(LaezariaIconURL)
                            .setTimestamp()
                            return sendEmbedLog(embed_welcome_missing_emoji, config.BotLogChannelID, 'Laezaria Bot - Logs');
                    });
            })
            .catch(() => {
                return sendEmbedLog(embed_welcome_missing_send_messages, config.BotLogChannelID, 'Laezaria Bot - Logs');
            })
    }
});