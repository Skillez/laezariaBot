const { bot, Discord, sendEmbedLog, embedColors, LaezariaIconURL, errorLog } = require('../app');
const config = require("../bot-settings.json");

/////////////////////////////////////////////////////////////////////////////////////////////
//      CHECK REACTIONS AND GIVE MEMBER ROLE WITH LAEZARIA ON THE APPLICATION CHANNEL      //
/////////////////////////////////////////////////////////////////////////////////////////////

bot.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channel.id === config.Application_ChannelID) {
        if (user.id === bot.user.id) return;

        if (reaction.message.guild.members.cache.some(check => check.id === user.id) === false) {
            errorLog(user.id, `application-reactions.js:1 messageReactionAdd Event\nUser that just reacted is not found as a member of ${reaction.message.guild.name}.`);
            return reaction.users.remove(user.id);
        }

        // let HighestRole = reaction.message.guild.members.cache.get(user.id).roles.highest.name
        let SenpaiRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.SenpaiRoleID);
        let ViceRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.ViceRoleID);
        let ManagerRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.ManagerRoleID);
        let EnforcerRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.EnforcerRoleID);
        let CaptainRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.CaptainRoleID);
        let MemberRole = reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.MemberRoleID);
        // console.error(`User: ${user.tag}\nSenpaiRole: ${SenpaiRole}\nViceRole: ${ViceRole}\nManagerRole: ${ManagerRole}\nCaptainRole: ${CaptainRole}\nEnforcerRole: ${EnforcerRole}\nMemberRole: ${MemberRole}`);

        // Fetch application reaction message to enable reaction function
        return reaction.message.fetch()
            .then(async () => {
                let applicantGuildMember;
                let applicantUser
                if (!reaction.message.embeds[0]) {
                    let applicantID = await reaction.message.author.id; // define applicantID from the message author (old application)
                    applicantGuildMember = reaction.message.guild.member(applicantID);
                    applicantUser = bot.users.cache.get(applicantID);
                }
                else {
                    let applicantID = await reaction.message.embeds[0].fields[5].value; // define applicantID from the embed (new application)
                    applicantGuildMember = reaction.message.guild.member(applicantID);
                    applicantUser = bot.users.cache.get(applicantID);
                }
                // console.error(applicantGuildMember);
                // console.error(applicantUser);
                // console.log('--------------------------------------------------------------------');

                if (ManagerRole || ViceRole || SenpaiRole) {
                    if (reaction.emoji.name === 'yeah') {

                        let botLogChannel = bot.channels.cache.get(config.BotLog_ChannelID);
                        if (botLogChannel) {
                            let YeahMessageFunc = `${user}, attention required!\n―――――――――――――――――\nIt looks like you've **ACCEPTED** this application!\n${reaction.message.url}\n\n**Target: ${applicantUser}**\n${applicantUser.tag}\nID: ${applicantUser.id}\n` + "```Please, confirm that the action is intended.```\n✅ Sends a welcome message to the target user\n❌ closes this menu if that was a misclick (the bot will not send any messages)";
                            return botLogChannel.send(YeahMessageFunc).then((message) => applicationVoteFinished(reaction, message, user, applicantGuildMember, applicantUser));
                        } else {
                            errorLog(`application-reactions.js:2 messageReactionAdd Event\nbotLogChannel not found.`, undefined);
                            return reaction.users.remove(user.id);
                        }
                    }

                    if (reaction.emoji.name === 'nay') {

                        let botLogChannel = bot.channels.cache.get(config.BotLog_ChannelID);
                        if (botLogChannel) {
                            let NayMessageFunc = `${user}, attention required!\n―――――――――――――――――\nIt looks like you've **REJECTED** this application!\n${reaction.message.url}\n\n**Target: ${applicantUser}**\n${applicantUser.tag}\nID: ${applicantUser.id}\n` + "```Please, confirm that the action is intended.```\n✅ Sends a reject message to the target user\n❌ closes this menu if that was a misclick (the bot will not send any messages)";
                            return botLogChannel.send(NayMessageFunc).then((message) => applicationVoteFinished(reaction, message, user, applicantGuildMember, applicantUser));
                        } else {
                            errorLog(`application-reactions.js:3 messageReactionAdd Event\nbotLogChannel not found.`, undefined);
                            return reaction.users.remove(user.id);
                        }
                    }

                    if (reaction.emoji.name === '⚠️') return addUserRole(applicantGuildMember, applicantUser, config.Application_RestrictionRoleID, reaction.emoji.name);
                }

                if (CaptainRole || EnforcerRole || ManagerRole || ViceRole || SenpaiRole) {
                    if (reaction.emoji.name === '🍏') return;
                    if (reaction.emoji.name === '🍎') return DMnegativeReaction();
                    if (reaction.emoji.name === 'laezaria') return addUserRole(applicantGuildMember, applicantUser, config.MemberRoleID, reaction.emoji.name);
                }

                if (MemberRole || CaptainRole || EnforcerRole || ManagerRole || ViceRole || SenpaiRole) {
                    if (reaction.emoji.name === '👍') return;
                    if (reaction.emoji.name === '👎') return DMnegativeReaction();
                }

                // remove any other undefined reaction
                return reaction.users.remove(user.id);

            }).catch(error => {
                errorLog(`application-reactions.js:4 messageReactionAdd event\nMaybe missing SEND_MESSAGES or something else.`, error);
                return reaction.users.remove(user.id);
            });

    } else return;

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function applicationVoteFinished(applicationReaction, message, reactUser, applicantGuildMember, applicantUser) {

        try {
            await message.react('✅');
            await message.react('❌');
        } catch (error) {
            errorLog(`application-reactions.js:1 applicationVoteFinished()\nProbably missing ADD_REACTIONS or emojis are not properly typed.`, error);
            message.delete().catch(() => { return });
            if (applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id)) {
                applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id).users.remove(reactUser.id).catch(error => errorLog(`application-reactions.js:2 applicationVoteFinished()\nMissing MANAGE_MESSAGES to remove '${applicationReaction.emoji.name}' emoji from the application message.`, error));
            }
        }

        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && reactUser === user;
        }

        if (applicationReaction.emoji.name === 'nay') {

            message.awaitReactions(filter, { max: 1, time: 300000 })
                .then(collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✅') {
                        SendThePrivateMessage(`${applicantGuildMember}, Your club application to **${message.channel.guild.name}** has been rejected! <:nay:244162428382871563>.`, applicantGuildMember, applicantUser);
                        return message.delete().catch(() => { return });
                    }

                    if (reaction.emoji.name === '❌') {
                        if (applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id)) {
                            applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id).users.remove(reactUser.id).catch(error => errorLog(`application-reactions.js:3 applicationVoteFinished()\nMissing MANAGE_MESSAGES to remove '${applicationReaction.emoji.name}' emoji from the application message.`, error));
                        }
                        return message.delete().catch(() => { return });
                    }
                })
                .catch(error => {
                    if (applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id)) {
                        applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id).users.remove(reactUser.id).catch(error => errorLog(`application-reactions.js:4 applicationVoteFinished()\nMissing MANAGE_MESSAGES to remove '${applicationReaction.emoji.name}' emoji from the application message.`, error));
                    }
                    return message.delete().catch(() => { return });
                });
        }

        if (applicationReaction.emoji.name === 'yeah') {

            message.awaitReactions(filter, { max: 1, time: 300000 })
                .then(collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✅') {
                        SendThePrivateMessage(`${applicantGuildMember}, Your club application to **${message.channel.guild.name}** has been approved <:yeah:244162428089270273>.\n<:laezaria:582281105298817032> 💬 Reply here or DM our staff to let us know when we can send you an invite to the club.`, applicantGuildMember, applicantUser);
                        return message.delete().catch(() => { return });
                    }

                    if (reaction.emoji.name === '❌') {
                        if (applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id)) {
                            applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id).users.remove(reactUser.id).catch(error => errorLog(`application-reactions.js:5 applicationVoteFinished()\nMissing MANAGE_MESSAGES to remove '${applicationReaction.emoji.name}' emoji from the application message.`, error));
                        }
                        return message.delete().catch(() => { return });
                    }
                })
                .catch(error => {
                    if (applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id)) {
                        applicationReaction.message.reactions.cache.get(applicationReaction.emoji.id).users.remove(reactUser.id).catch(error => errorLog(`application-reactions.js:6 applicationVoteFinished()\nMissing MANAGE_MESSAGES to remove '${applicationReaction.emoji.name}' emoji from the application message.`, error));
                    }
                    return message.delete().catch(() => { return });
                });
        }
    }

    function SendThePrivateMessage(message2send, applicantGuildMember, applicantUser) {

        if (!applicantGuildMember) { // If user to send a direct message is not found as member of the guild
            // define the embed: reject member left success log
            let embed_reject_member_left_success_log = new Discord.MessageEmbed()
                .setColor('RED')
                .setAuthor(`Application Reject - ERROR`, LaezariaIconURL)
                .setDescription(`\n_Receiver is not found as a member of ${reaction.message.channel.guild.name}._\n[**Jump to application message**](${reaction.message.url})`)
                .addFields(
                    { name: `${reaction.emoji} Used by`, value: user, inline: true },
                    { name: `Channel`, value: reaction.message.channel, inline: true },
                    { name: `Receiver Information`, value: `${applicantUser}\n${applicantUser.tag}\nID: ${applicantUser.id}`, inline: false })
                .setFooter(`LOG:ID ApplicationReactionJS_1`)
                .setThumbnail(LaezariaIconURL)
                .setTimestamp()

            // define the embed: accept member left success log
            let embed_accept_member_left_success_log = new Discord.MessageEmbed()
                .setColor('RED')
                .setAuthor(`Application Accept - ERROR`, LaezariaIconURL)
                .setDescription(`\n_Receiver is not found as a member of ${reaction.message.channel.guild.name}._\n[**Jump to application message**](${reaction.message.url})`)
                .addFields(
                    { name: `${reaction.emoji} Used by`, value: user, inline: true },
                    { name: `Channel`, value: reaction.message.channel, inline: true },
                    { name: `Receiver Information`, value: `${reaction.message.author}\n${reaction.message.author.tag}\nID: ${reaction.message.author.id}`, inline: false })
                .setFooter(`LOG:ID ApplicationReactionJS_2`)
                .setThumbnail(LaezariaIconURL)
                .setTimestamp()

            if (reaction.emoji.name === "yeah") return sendEmbedLog(embed_accept_member_left_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');
            return sendEmbedLog(embed_reject_member_left_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');
        }

        if (applicantGuildMember.user.bot) return;

        // define the embed: reject dm success log
        let embed_reject_dm_success_log = new Discord.MessageEmbed()
            .setColor(embedColors.AppRejected)
            .setAuthor(`Application Rejected!`, LaezariaIconURL)
            .setDescription(`_Reject message sent correctly!_\n[**Jump to application message**](${reaction.message.url})`)
            .addFields(
                { name: `${reaction.emoji} Used by`, value: user, inline: true },
                { name: `Channel`, value: reaction.message.channel, inline: true },
                { name: `Receiver Information`, value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
            .setFooter(`LOG:ID ApplicationReactionJS_3`)
            .setThumbnail(applicantGuildMember.user.avatarURL())
            .setTimestamp()

        // define the embed: accept dm success log
        let embed_accept_dm_success_log = new Discord.MessageEmbed()
            .setColor(embedColors.AppAccepted)
            .setAuthor(`Application Accepted!`, LaezariaIconURL)
            .setDescription(`_Welcome message sent correctly!_\n[**Jump to application message**](${reaction.message.url})`)
            .addFields(
                { name: `${reaction.emoji} Used by`, value: user, inline: true },
                { name: `Channel`, value: reaction.message.channel, inline: true },
                { name: `Receiver Information`, value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
            .setFooter(`LOG:ID ApplicationReactionJS_4`)
            .setThumbnail(applicantGuildMember.user.avatarURL())
            .setTimestamp()

        return applicantGuildMember.send(message2send)
            .then(() => {
                if (reaction.emoji.name === "yeah") return sendEmbedLog(embed_accept_dm_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');
                return sendEmbedLog(embed_reject_dm_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');

            }).catch(() => { // IF DIRECT MESSAGE CANNOT BE DELIEVERED
                // define the embed: channel reject success log
                let embed_reject_channel_success_log = new Discord.MessageEmbed()
                    .setColor(embedColors.AppRejected)
                    .setDescription(`\n_Receiver has DMs disabled.\nReject message sent on the <#${config.WelcomeChannelID}> instead._\n[**Jump to application message**](${reaction.message.url})`)
                    .setAuthor(`Application Rejected!`, LaezariaIconURL)
                    .addFields(
                        { name: `${reaction.emoji} Used by`, value: user, inline: true },
                        { name: `Channel`, value: reaction.message.channel, inline: true },
                        { name: `Receiver Information`, value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
                    .setFooter(`LOG:ID ApplicationReactionJS_5`)
                    .setThumbnail(applicantGuildMember.user.avatarURL())
                    .setTimestamp()

                // define the embed: channel accept success log
                let embed_accept_channel_success_log = new Discord.MessageEmbed()
                    .setColor(embedColors.AppAccepted)
                    .setDescription(`\n_Receiver has DMs disabled.\nWelcome message sent on the <#${config.WelcomeChannelID}> instead._\n[**Jump to application message**](${reaction.message.url})`)
                    .setAuthor(`Application Accepted!`, LaezariaIconURL)
                    .addFields(
                        { name: `${reaction.emoji} Used by`, value: user, inline: true },
                        { name: `Channel`, value: reaction.message.channel, inline: true },
                        { name: `Receiver Information`, value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
                    .setFooter(`LOG:ID ApplicationReactionJS_6`)
                    .setThumbnail(applicantGuildMember.user.avatarURL())
                    .setTimestamp()

                let MessageChannel = reaction.message.channel.guild.channels.cache.find(ch => ch.id === config.WelcomeChannelID);
                if (MessageChannel) {
                    return MessageChannel.send(message2send)
                        .then(() => {
                            if (reaction.emoji.name === "yeah") sendEmbedLog(embed_accept_channel_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');
                            return sendEmbedLog(embed_reject_channel_success_log, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');
                        });
                }
            });
    }

    function DMnegativeReaction() {
        let MemberWithNegativeReaction = bot.users.cache.get(user.id);
        MemberWithNegativeReaction.send(`Hello there, seems like you reacted with ${reaction.emoji.name} emoji!\n**Please respond with the reason why you reacted in that way** under this application:\n${reaction.message.url}\nVote without reason won't be counted.`)
            .catch(() => {
                // define the embed: error to send a DM
                let add_reaction_role_dm_error = new Discord.MessageEmbed()
                    .setColor(embedColors.AppReaction)
                    .setAuthor('Negative Reaction - WARNING', LaezariaIconURL)
                    .setDescription(`[**Jump to application message**](${reaction.message.url})`)
                    .addFields(
                        { name: `${reaction.emoji} Used by`, value: MemberWithNegativeReaction, inline: true },
                        { name: `Channel`, value: reaction.message.channel, inline: true },
                        { name: 'Reason', value: `I couldn't ask the user about a reason.\n**User has DMs disabled**`, inline: false })
                    .setFooter(`LOG:ID ApplicationReactionJS_7`)
                    .setThumbnail(LaezariaIconURL)
                    .setTimestamp()
                return sendEmbedLog(add_reaction_role_dm_error, config.BotLog_DirectMessageChannelID, 'Laezaria Bot - Direct Messages');

            });
    }

    async function addUserRole(applicantGuildMember, applicantUser, roleID, reactionUsed) {
        let ReactAuthor = bot.users.cache.get(user.id);
        let role2add = reaction.message.guild.roles.cache.find(role => role.id === roleID);

        if (!role2add) {
            reaction.users.remove(user.id);
            return errorLog(`application-reactions.js:1 addUserRole()\nI cannot find the role with provided ID in config.MemberRoleID.`, undefined);
        }

        if (reactionUsed === 'laezaria') {
            if (applicantGuildMember) {
                let MemberRoleAdded = await applicantGuildMember.roles.add(role2add)
                    .catch(error => errorLog(`application-reactions.js:2 addUserRole()\nError to add a role probably missing MANAGE_ROLES.`, error));

                if (MemberRoleAdded) {
                    // define the embed: confirmation log
                    let member_role_log_confirmation = new Discord.MessageEmbed()
                        .setColor(embedColors.AppReaction)
                        .setAuthor(`Added ${role2add.name} with a reaction`, LaezariaIconURL)
                        .setDescription(`[**Jump to application message**](${reaction.message.url})`)
                        .addFields(
                            { name: `${reaction.emoji} Used by`, value: ReactAuthor, inline: true },
                            { name: `Channel`, value: reaction.message.channel, inline: true },
                            { name: 'Role Receiver Information', value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
                        .setFooter(`LOG:ID ApplicationReactionJS_8`)
                        .setThumbnail(LaezariaIconURL)
                        .setTimestamp()
                    return sendEmbedLog(member_role_log_confirmation, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
                }
            } else { // if applicantGuildMember is not found
                return ReactAuthor.send(`❌ There is an error with your recent activity!\n\nI couldn't add **${role2add.name}** role to ${applicantUser.tag} and you have do that manually if possible.\nPlease, check out the <#${config.BotLog_ChannelID}> for more information!`)
                    .catch(error => errorLog(`application-reactions.js:3 addUserRole()\nI cannot send the message to the ReactAuthor.`, error))
                    .then(() => {

                        // define the embed: error to add a member role
                        let member_role_error_log = new Discord.MessageEmbed()
                            .setColor(`RED`)
                            .setAuthor(`Add ${role2add.name} - ERROR`, LaezariaIconURL)
                            .setDescription(`**Receiver is not found as a member of ${reaction.message.guild.name}**\n[**Jump to application message**](${reaction.message.url})`)
                            .addFields(
                                { name: `${reaction.emoji} Used by`, value: ReactAuthor, inline: true },
                                { name: `Channel`, value: reaction.message.channel, inline: true },
                                { name: 'Receiver Information', value: `${applicantUser}\n${applicantUser.tag}\nID: ${applicantUser.id}`, inline: false })
                            .setFooter(`LOG:ID ApplicationReactionJS_9`)
                            .setThumbnail(LaezariaIconURL)
                            .setTimestamp()
                        return sendEmbedLog(member_role_error_log, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
                    });
            }
        }

        if (reactionUsed === '⚠️') {
            if (applicantGuildMember) {
                let RestrictionRoleAdded = await applicantGuildMember.roles.add(role2add)
                    .catch(error => errorLog(`application-reactions.js:4 addUserRole()\nError to add a role probably missing MANAGE_ROLES.`, error));

                if (RestrictionRoleAdded) {
                    // define the embed: confirmation log
                    let restriction_role_log_confirmation = new Discord.MessageEmbed()
                        .setColor(embedColors.AppReaction)
                        .setAuthor(`Added ${role2add.name} with a reaction`, LaezariaIconURL)
                        .setDescription(`[**Jump to application message**](${reaction.message.url})`)
                        .addFields(
                            { name: `${reaction.emoji} Used by`, value: ReactAuthor, inline: true },
                            { name: `Channel`, value: reaction.message.channel, inline: true },
                            { name: 'Role Receiver Information', value: `${applicantGuildMember}\n${applicantGuildMember.displayName}\n${applicantGuildMember.user.tag}\nID: ${applicantGuildMember.id}`, inline: false })
                        .setFooter(`LOG:ID ApplicationReactionJS_10`)
                        .setThumbnail(LaezariaIconURL)
                        .setTimestamp()
                    return sendEmbedLog(restriction_role_log_confirmation, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
                }
            } else { // if applicantGuildMember is not found
                return ReactAuthor.send(`❌ There is an error with your recent activity!\n\nI couldn't add **${role2add.name}** role to ${applicantUser.tag} and you have do that manually if possible.\nPlease, check out the <#${config.BotLog_ChannelID}> for more information!`)
                    .catch(error => errorLog(`application-reactions.js:5 addUserRole()\nI cannot send the message to the ReactAuthor.`, error))
                    .then(() => {

                        // define the embed: error to add a member role
                        let restriction_role_error_log = new Discord.MessageEmbed()
                            .setColor(`RED`)
                            .setAuthor(`Add ${role2add.name} - ERROR`, LaezariaIconURL)
                            .setDescription(`**Receiver is not found as a member of ${reaction.message.guild.name}**\n[**Jump to application message**](${reaction.message.url})`)
                            .addFields(
                                { name: `${reaction.emoji} Used by`, value: ReactAuthor, inline: true },
                                { name: `Channel`, value: reaction.message.channel, inline: true },
                                { name: 'Receiver Information', value: `${applicantUser}\n${applicantUser.tag}\nID: ${applicantUser.id}`, inline: false })
                            .setFooter(`LOG:ID ApplicationReactionJS_11`)
                            .setThumbnail(LaezariaIconURL)
                            .setTimestamp()
                        return sendEmbedLog(restriction_role_error_log, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
                    });
            }
        }


    }
});