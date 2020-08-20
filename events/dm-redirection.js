const { bot, Discord, sendEmbedLog, embedColors, LaezariaIconURL } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                            DIRECT MESSAGE REDIRECTION HANDLER                            //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("message", async message => {
    let guild = bot.guilds.cache.get(config.LaezariaServerID);

    if (message.channel.type === "dm") {
        if (message.author.bot) return;
        if (message.content.startsWith(config.BotPrefix) || message.content.startsWith(`laez${config.BotPrefix}`) || message.content.startsWith(`l${config.BotPrefix}`) || message.content.startsWith(`eminem${config.BotPrefix}`) || message.content.startsWith(`slim${config.BotPrefix}`)) return;

        if (!guild.member(message.author.id)) { // there is no a GuildMember with that ID
            message.author.send(`You are not in ${guild.name} <:laezaria:582281105298817032>, and your message will not be delivered 😥\nFeel free to join in any time https://discord.gg/2u5NtSR`).catch(() => { return });
            return sendEmbedLog(`${message.author} - ${message.author.tag} (${message.author.id})\nTried to send a DM, but he is not in **${guild.name}**!`, config.BotDirectMessageChannelID, 'Laezaria Bot - Direct Messages');
        }

        let dmAuthor = bot.guilds.cache.get(config.LaezariaServerID).member(message.author.id);
        if (dmAuthor) {

            if (message.attachments.array()[0]) {
                let messageContent = message.content;
                if (!message.content) {
                    messageContent = 'Empty message'
                }

                // define the embed: message received with attachment without content
                let embed_dm_function_received_attachment = new Discord.MessageEmbed()
                    .setColor(embedColors.DMredirect)
                    .setAuthor(`I've received a new message!`, LaezariaIconURL)
                    .setDescription(`Message:\n` + '```' + `${messageContent}` + '```' + `Attachment: [**Click to view attachment**](${message.attachments.array()[0].url})`)
                    .addFields(
                        { name: 'Sender Information', value: `${dmAuthor}\n${dmAuthor.displayName}\n${dmAuthor.user.tag}\nID: ${dmAuthor.id}`, inline: false },
                        { name: '--- COPY TEXT BELOW TO REPLY ---', value: `**${config.BotPrefix}dm ${dmAuthor.id} message**\n${config.BotPrefix}dm ${dmAuthor} message`, inline: false })
                    .setFooter(`LOG:ID dmRedirectionJS_1`)
                    .setThumbnail(dmAuthor.user.avatarURL())
                    .setTimestamp()
                return sendEmbedLog(embed_dm_function_received_attachment, config.BotDirectMessageChannelID, 'Laezaria Bot - Direct Messages');
            }

            // define the embed: message received without attachment
            let embed_dm_function_received = new Discord.MessageEmbed()
                .setColor(embedColors.DMredirect)
                .setAuthor(`I've received a new message!`, LaezariaIconURL)
                .setDescription(`Message:\n` + '```' + `${message.content}` + '```')
                .addFields(
                    { name: 'Sender Information', value: `${dmAuthor}\n${dmAuthor.displayName}\n${dmAuthor.user.tag}\nID: ${dmAuthor.id}`, inline: false },
                    { name: '--- COPY TEXT BELOW TO REPLY ---', value: `**${config.BotPrefix}dm ${dmAuthor.id} message**\n${config.BotPrefix}dm ${dmAuthor} message`, inline: false })
                .setFooter(`LOG:ID dmRedirectionJS_2`)
                .setThumbnail(dmAuthor.user.avatarURL())
                .setTimestamp()
                return sendEmbedLog(embed_dm_function_received, config.BotDirectMessageChannelID, 'Laezaria Bot - Direct Messages');
        }
    }
});