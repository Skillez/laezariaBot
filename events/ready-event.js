const { bot, Discord, sendEmbedLog, embedColors, LaezariaIconURL, BotVersion, errorLog } = require('../app');
const config = require("../bot-settings.json");
const fs = require("fs");

bot.login(config.BotToken);

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    READY EVENT HANDLER                                   //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    const guild = bot.guilds.cache.get(config.LaezariaServerID);

    // Fetch all members from the guild
    guild.members.fetch()
        .then(async () => {

            let totalUsers = guild.memberCount
            let totalCachedUsers = guild.members.cache.size
            let totalOnlineUsers = guild.members.cache.filter(m => m.presence.status === 'online').size
            let totalAFKUsers = guild.members.cache.filter(m => m.presence.status === 'idle').size
            let totalDNDUsers = guild.members.cache.filter(m => m.presence.status === 'dnd').size
            let totalOfflineUsers = guild.members.cache.filter(m => m.presence.status === 'offline').size

            console.info(`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nSkillez Bot (${bot.user.tag}) has logged in!\nServes ${totalUsers} people in ${guild.name}\nVersion: ${BotVersion}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);

            // Set the client user's presence
            if (guild) {
                bot.user.setPresence({ activity: { name: 'with Laezaria', type: 'PLAYING' }, status: 'idle' }).catch(error => errorLog(`ready-event.js:1 ready Event()\nError to set the bot activity.`, error))
                    .then(() => {
                        setInterval(() => { // update status every hour
                            bot.user.setPresence({ activity: { name: `${guild.memberCount} Laezarians 👀`, type: 'WATCHING' }, status: 'online' }).catch(error => errorLog(`ready-event.js:2 ready Event()\nError to set the bot activity.`, error));
                        }, 3600000);
                    })
            } else {
                // Set the bot user's presence 
                bot.user.setPresence({ activity: { name: 'error to load guild', type: 'WATCHING' }, status: 'idle' })
                    .catch(error => errorLog(`ready-event.js:3 ready Event()\nError to set the bot activity.`, error));
            }

            const Owner = bot.users.cache.get(config.BotOwnerID);
            //define the embed: bot is ready to work
            let embed_bot_logged = new Discord.MessageEmbed()
                .setColor(embedColors.ReadyEvent)
                .setAuthor(`Bot has logged in successfully!`, LaezariaIconURL)
                .setTitle(`Status: ${bot.user.presence.status.toUpperCase()}`)
                .setDescription(`\n‏‏‎\n**${totalUsers}** total members in **${guild.name}**\nServer Boost Tier **${guild.premiumTier}** with **${guild.premiumSubscriptionCount}** subscriptions!\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n**${totalCachedUsers}** users cached\n----------------------------\n**${totalOnlineUsers}** Online\n**${totalAFKUsers}** AFK\n**${totalDNDUsers}** DND\n**${totalOfflineUsers}** Invisible/Offline\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n❗ Version: **${BotVersion}**‏‏‎‎`)
                .addFields(
                    { name: 'Username', value: bot.user.username, inline: true },
                    { name: 'Discriminator', value: bot.user.discriminator, inline: true },
                    { name: 'Nickname', value: bot.user, inline: true },
                    { name: 'Bot Owner', value: Owner, inline: true },
                    { name: 'Guild Owner', value: guild.owner, inline: true },
                    { name: 'Bot Account ID', value: bot.user.id, inline: false },
                )
                .setThumbnail(bot.user.displayAvatarURL())
                .setImage('https://skillez.eu/images/discord/laezbanner.png')
                .setFooter('Bot is ready to work')
                .setTimestamp()
            await sendEmbedLog(embed_bot_logged, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
        }).catch(error => errorLog(`ready-event.js:4 ready Event()\nError to fetch guild members i guess.`, error));


    // Post patch notes on captain channel.
    const patchNotesChannel = guild.channels.cache.get(config.CaptainChannelID);
    if (patchNotesChannel) {
        const patchNotes = fs.readFileSync("./README.md", "utf8");

        // Do not post patch notes if READ.md has 'botIgnore' at the end
        if (patchNotes.split(" ").slice(-1)[0] === 'botIgnore') return;
        else patchNotesChannel.send(patchNotes)
            .catch(error => errorLog('ready-event.js:5 ready Event()\nError to post patch notes.', error));
    }

});