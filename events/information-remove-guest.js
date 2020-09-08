const { bot, Discord, sendEmbedLog, LaezariaIconURL, embedColors, errorLog } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//               REMOVE GUEST ROLE HANDLER USING LAEZARIA EMOJI IN INFORMATION              //
//////////////////////////////////////////////////////////////////////////////////////////////
bot.on('messageReactionAdd', async (reaction, user) => {

    if (reaction.message.channel.id === config.InformationChannelID) {

        if (reaction.message.id === config.InformationReactRoleMessageID) {
            if (reaction.emoji.name === 'wf' || reaction.emoji.name === 'csgo' || reaction.emoji.name === 'LoL' || reaction.emoji.name === 'destiny') return;
        }

        // Fetch application reaction message to enable reaction function
        reaction.message.fetch({ limit: 1 })
            .then(() => {

                if (reaction.emoji.name != 'laezaria' && !user.bot) {
                    // define the embed: log information reactions
                    let embed_information_react_log = new Discord.MessageEmbed()
                        .setColor(embedColors.InfoReactionLog)
                        .setAuthor(`#${reaction.message.channel.name} - reaction`, LaezariaIconURL)
                        .setDescription(`${user.tag}(${user}) reacted with ${reaction.emoji}`)
                        .setFooter(`ID: ${user.id}`)
                        .setTimestamp()
                    sendEmbedLog(embed_information_react_log, config.BotLog_Minor_ChanneLID, 'Laezaria Bot - Minor Logs');
                }

                if (reaction.emoji.name === 'laezaria' && !user.bot) {
                    removeGuestRole(user);
                }

                return reaction.users.remove(user.id) // remove not whitelisted emoji on reaction
                // .then(() => { console.log(`Removed emoji from the ${user.tag}`) });

            }).catch(error => errorLog(`information-remove-guest.js:1 messageReactionAdd Event\nProbably READ_MESSAGE_HISTORY missing on the #information channel.`, error));
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function removeGuestRole(user) {
        // user that reacted under the message as a GuildMember object and role to remove
        let reactAuthor = reaction.message.guild.members.cache.find(member => member.id === user.id);
        let role2remove = reaction.message.guild.roles.cache.find(role => role.id === config.GuestRoleID);

        // check if role and user are correct, if so then remove guest role
        if (!role2remove) return errorLog(`information-remove-guest.js:1 removeGuestRole()\nrole2remove not found.`, error);

        if (reactAuthor) {
            if (reactAuthor.roles.cache.some(role => role.id === config.GuestRoleID)) {
                let roleIsRemoved = await reactAuthor.roles.remove(role2remove)
                    .catch(error => {
                        reactAuthor.send(`❌ Error during role deletion, try again or contact discord manager.`)
                        // .then(message => { message.delete({ timeout: 10000 }).catch(() => { return; }) });
                        errorLog(`information-remove-guest.js:2 removeGuestRole()\nrole2remove is not found.`, error);
                    });
                if (roleIsRemoved) {
                    // define the embed: log information laezaria reactions - role removed
                    let embed_information_laez_react_log = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setAuthor(`#${reaction.message.channel.name} - Guest role deletion`, LaezariaIconURL)
                        .setDescription(`${user.tag}(${user}) reacted with ${reaction.emoji}`)
                        .setFooter(`ID: ${user.id}`)
                        .setTimestamp()
                    sendEmbedLog(embed_information_laez_react_log, config.BotLog_Minor_ChanneLID, 'Laezaria Bot - Minor Logs');

                    return reactAuthor.send(`${user}, Your ${role2remove.name} role has been removed 😃`)
                    // .then(message => { message.delete({ timeout: 10000 }).catch(() => { return; }) });
                }
            } else {
                // define the embed: log information laezaria reactions - user doesnt have a guest role
                let embed_information_react_log = new Discord.MessageEmbed()
                    .setColor(embedColors.InfoReactionLog)
                    .setAuthor(`#${reaction.message.channel.name} - reaction`, LaezariaIconURL)
                    .setDescription(`${user.tag}(${user}) reacted with ${reaction.emoji}`)
                    .setFooter(`ID: ${user.id}`)
                    .setTimestamp()
                    sendEmbedLog(embed_information_react_log, config.BotLog_Minor_ChanneLID, 'Laezaria Bot - Minor Logs');
            }
        }
    }
});