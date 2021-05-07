const { Discord, LaezariaIconURL, errorLog, removeUserLastMessage, sendEmbedLog, embedColors, botPermission } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "apply",
    description: "Official way to join our club with an interactive system.",
    type: "public",
    usage: "Type the command and follow instructions."
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                  interactive application                                 //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (message.channel.id != config.application.processChannelID) {
        return message.reply(`You can only apply on the <#${config.application.processChannelID}> channel!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
    }

    if (message.member.roles.cache.some(role => role.id === config.roles.guestRoleID))
        return setTimeout(() => {
            GuestQuestion1();
        }, 1000);
    // message.reply(`Hello!\nThank you for your interest to join **${bot.guilds.cache.get(config.laezariaServerID).name}** <:laezaria:582281105298817032>\nUnfortunately, you can't apply at the moment.\nPlease take some time to familiarise yourself with our <#${config.channels.informationChannelID}> channel before you proceed to send an application.`)
    //     .then(message => message.delete({ timeout: 20000 })).catch(() => { return });

    if (message.member.roles.cache.some(role => role.id === config.roles.memberRoleID))
        return message.reply(`Hello!\nIt seems that you are an ex-member of the club, if you would like to rejoin the club, please contact any of our club's staffs (senpai, manager).`)
            .then(message => message.delete({ timeout: 20000 })).catch(() => { return });

    if (message.member.roles.cache.some(role => role.id === config.application.restrictionRoleID))
        return message.reply(`You are banned from using this command.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });


    //////////////////////////////////////////////////////////////////////////////////////////////

    const appChannel = message.guild.channels.cache.find(ch => ch.id === config.application.channelID);
    const appStorageChannel = message.guild.channels.cache.find(ch => ch.id === config.application.storageChannelID);
    const appProcessChannel = message.guild.channels.cache.find(ch => ch.id === config.application.processChannelID);

    if (appChannel && appStorageChannel) {
        const appChannelReadMessagesCheck = await appChannel.messages.fetch({ limit: 1 }).catch(() => { return });
        const appStorageChannelReadMessagesCheck = await appStorageChannel.messages.fetch({ limit: 1 }).catch(() => { return });

        if (!appChannelReadMessagesCheck || !appStorageChannelReadMessagesCheck) {
            errorLog(`apply.js:1\nNot enough permissions for the #${appChannel.name} or #${appStorageChannel.name} channel.\n[READ_MESSAGES]`, undefined)
            return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
        }
    } else { // if missing one of the required channels
        // define the embed: missing application/storage channel
        let embed_application_missing_channels = new Discord.MessageEmbed()
            .setColor('RED')
            .setAuthor('apply.js - ERROR', LaezariaIconURL)
            .setTitle(`Club Application System - ERROR`)
            .addFields({ name: 'Reason', value: `I cannot locate the **Application** or/and **Storage** channel`, inline: false })
            .setFooter(`LOG:ID ClubApplicationJS_1`)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()
        return sendEmbedLog(embed_application_missing_channels, config.botlogs.channelID, 'Laezaria Bot - Logs');
    }

    if (!appChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) { // requirement for application channel
        errorLog(`apply.js:2 Not enough permissions for the #${appChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    else if (!appStorageChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'])) { // requirement for application storage channel
        errorLog(`apply.js:3 Not enough permissions for the #${appStorageChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ATTACH_FILES - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    else if (!appProcessChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) { // requirement for application storage channel
        errorLog(`apply.js:4 Not enough permissions for the #${appProcessChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    else if (!botPermission('MANAGE_NICKNAMES')) {
        errorLog(`apply.js:5 Not enough permissions for the application system [MANAGE_NICKNAMES].`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    const filter = m => m.author.id === message.author.id;

    return message.reply("Before we proceed forward, make sure you have the values for these stats.\n**Note:** Contact the discord manager if you are experiencing any errors with the command.\n\nWhat do you need?\n```less\n[1] Trove Mastery Points (exact number from the leaderboard)\n[2] Geode Mastery Points (exact number from the leaderboard)\n[3] Highest Class Power Rank (exact number)\n[4] Screenshot with visible character sheet (C)```Example: https://i.imgur.com/ejao9la.png\n\nWe strongly recommend to use **Enhanced UI Mod** which is available on Trovesaurus and Steam Workshop.\n\nIf you're ready, then type **ready** or __anything else__ to abandon this application.")
        .then(ReadyQuestion => {
            message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                .then(ReadyAnswer => {
                    ReadyQuestion.delete().catch(() => { return }); // remove bot ready check after answer
                    if (ReadyAnswer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                    if (ReadyAnswer.first().content.toLowerCase() === 'ready') {
                        removeUserLastMessage(message.author); // remove after user typed ready
                        return setTimeout(() => {
                            Question1();
                        }, 1000);

                    } else { // if something else than ready was typed
                        removeUserLastMessage(message.author); // something else was typed than ready and user message is removed

                        return message.channel.send(`${message.author} ❌ Cancelling...`)
                            .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                    }

                }).catch(error => {
                    if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                        .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                    removeUserLastMessage(message.author); // remove after user typed answer
                    errorLog(`apply.js:1 Ready Check Question\nError when user answer the ready check question.`, error);
                });
        });

    /////////////////////////////////////////////////////////////////////////////////////////

    function GuestQuestion1() { // Ask if applicant read information channel
        const filter = m => m.author.id === message.author.id;
        return message.reply(`Did you read <#${config.channels.informationChannelID}> channel and you aware of our guidelines/rules? (Yes/No)\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (!Answer.first().content) { // if answer has no message content aka attachment added or some shit like that.
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (Answer.first().content.toLowerCase() === 'yes' || Answer.first().content.toLowerCase() === 'y' || Answer.first().content.toLowerCase() === 'ye') {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`❌ ${message.author}, Why do you have a guest role then? 🤔\nGo to the <#${config.channels.informationChannelID}> channel and read how to get rid of this role and try again.`)
                                .then(message => message.delete({ timeout: 15000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (Answer.first().content.toLowerCase() === 'no' || Answer.first().content.toLowerCase() === 'n' || Answer.first().content.toLowerCase() === 'nah') {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`❌ ${message.author}, Well, at least you are honest with us, but please go to the <#${config.channels.informationChannelID}> channel read how to remove a guest role from your account and try again ;)`)
                                .then(message => message.delete({ timeout: 15000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (Answer.first().content.toLowerCase() === 'idc') {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`✅ Excellent answer ${message.author}!\nYou have been promoted to an **officer**!`)
                                .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // remove bot exit request message.
                        }
                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 GuestQuestion1()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question1() { // In-game nick question
        return message.channel.send(`Alright, ${message.author} let's start with something easy, what is your **in-game name**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (Answer.first().content.length < 3) { // if answer is shorter than 3 characters
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Nickname is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (Answer.first().content.length > 20) { // if answer is longer than 20 characters
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Nickname is too long.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        // let nickName = Answer.first().content;
                        return setTimeout(() => {
                            // return Question2(Answer.first().content);
                            referralQuestion1(Answer.first().content, message.author);
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question1()\nError when user answer the question.`, error);
                    });
            });
    }

    function referralQuestion1(nickName, applicationAuthor) {
        return message.reply(`Have you been referred by our staff(enforcer+)?`)
            .then(async Question => {
                try {
                    await Question.react('✅');
                    await Question.react('❌');
                } catch (error) {
                    message.channel.send(`An unknown error occured ;(`)
                        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
                    errorLog(`apply.js:1 referralQuestion1()\nError to add reactions probably wrong emojis.`, error)
                }

                const emojiFilter = (reaction, user) => {
                    return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && applicationAuthor === user;
                }

                Question.awaitReactions(emojiFilter, { max: 1, time: 180000 })
                    .then(collected => {
                        const reaction = collected.first();

                        if (reaction.emoji.name === '✅') {
                            return Question.delete().catch(() => { return })
                                .then(() => {
                                    return setTimeout(() => {
                                        // console.log(`${applicationAuthor.tag} reacted with ✅`);
                                        referralQuestion2(nickName);
                                    }, 1000);
                                })
                        }

                        if (reaction.emoji.name === '❌') {
                            return Question.delete().catch(() => { return })
                                .then(() => {
                                    return setTimeout(() => {
                                        // console.log(`${applicationAuthor.tag} reacted with ❌`);
                                        Question2('None', nickName);
                                    }, 1000);
                                })
                        }
                    })
                    .catch(error => {
                        if (error.message === "Cannot read property 'emoji' of undefined") return message.channel.send(`${message.author} ❌ There was no reaction within the time limit (3mins)! - cancelling...`)
                            .then(message => {
                                message.delete({ timeout: 30000 }).catch(() => { return });
                                Question.delete().catch(() => { return });
                            }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:2 previewConfirmation()\nError when user answer the question.`, error);
                    });
            });
    }

    function referralQuestion2(nickName) {
        return message.reply(`Please mention enforcer+ that referred you.\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (Answer.first().content.startsWith('<@') && Answer.first().content.endsWith('>')) {
                            const ReplaceMentionToID = Answer.first().content.replace(/[\\<>@#&!]/g, ""); // replace mention to an ID

                            const referralGuildMember = message.guild.members.cache.get(ReplaceMentionToID);
                            if (referralGuildMember) {

                                if (referralGuildMember.roles.cache.some(role => role.id === config.roles.senpaiRoleID)
                                    || referralGuildMember.roles.cache.some(role => role.id === config.roles.viceRoleID)
                                    || referralGuildMember.roles.cache.some(role => role.id === config.roles.managerRoleID)
                                    || referralGuildMember.roles.cache.some(role => role.id === config.roles.enforcerRoleID)) {
                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    return setTimeout(() => {
                                        // console.log(`referralQuestion2 finished\nReferred: ${referralGuildMember.user.tag} and has Senpai/Vice/Manager or Enforcer role.`);
                                        Question2(referralGuildMember.user, nickName);
                                    }, 1000);
                                } else {
                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    return message.channel.send(`${message.author} ❌ The application has been cancelled - Your referral is not enforcer+.`)
                                        .then(message => message.delete({ timeout: 5000 })).catch(() => { return }) // remove bot exit request message.
                                }
                            } else {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return message.channel.send(`${message.author} ❌ The application has been cancelled - Invalid referral.`)
                                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return }) // remove bot exit request message.
                            }
                        } else {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - You didn't mention referral.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }) // remove bot exit request message.
                            // .then(referralQuestion2(nickName));
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question1()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question2(appReferral, nickName) { // Trove mastery points question
        return message.reply(`Hey ${nickName}, what is your **TROVE Mastery Points**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (!Answer.first().content) { // if answer has no message content aka attachment added or some shit like that.
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        let replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replace2Number) === true) { // if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replace2Number > 150000) { // Check TROVE mastery points - upper limit 150,000 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your Trove Mastery Points are too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        return setTimeout(() => {
                            Question3(appReferral, nickName, Number(replace2Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question2()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question3(appReferral, nickName, trovePoints) { // Geode mastery points question
        return message.reply(`What is your **GEODE Mastery Points**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (!Answer.first().content) { // if answer has no message content aka attachment added or some shit like that.
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        let replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replace2Number) === true) { // if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replace2Number > 20000) { // Check GEODE mastery points - upper limit - 20,000 points
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your Geode Mastery Points are too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        return setTimeout(() => {
                            Question4(appReferral, nickName, trovePoints, Number(replace2Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question3()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question4(appReferral, nickName, trovePoints, geodePoints) { // Power rank question
        return message.reply(`What is your **highest Power Rank**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (!Answer.first().content) { // if answer has no message content aka attachment added or some shit like that.
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        let replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replace2Number) === true) { //if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replace2Number > 45000) { // Check Power Rank - upper limit - 45,000 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your highest Power Rank is too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        return setTimeout(() => {
                            RequirementsCheck(appReferral, nickName, trovePoints, geodePoints, Number(replace2Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question4()\nError when user answer the question.`, error);
                    });
            });
    }

    function RequirementsCheck(appReferral, nickName, trovePoints, geodePoints, powerRank) { // Check if applicant meet club requirements
        let masteryBottom = '';
        let geodeBottom = '';
        let powerrankBottom = '';

        if (powerRank >= config.requirements.powerRank) { // Check Power Rank - bottom limit - 30,000 points
            return setTimeout(() => {
                Question5(appReferral, nickName, trovePoints, geodePoints, powerRank);
            }, 1000);
        } else {
            powerrankBottom = 'Your **highest Power Rank** is below our requirements.\n';

            if (trovePoints >= config.requirements.trovePoints && geodePoints >= config.requirements.geodePoints) { // Check TROVE mastery points above 69200 points (500 mastery) and GEODE points above 4,100 (50 mastery)
                return setTimeout(() => {
                    Question5(appReferral, nickName, trovePoints, geodePoints, powerRank);
                }, 1000);
            } else {
                if (trovePoints < config.requirements.trovePoints) masteryBottom = '**Trove Mastery Points** are below our requirements.\n';
                if (geodePoints < config.requirements.geodePoints) geodeBottom = '**Geode Mastery Points** are below our requirements.';
            }
        }

        if (masteryBottom || geodeBottom || powerrankBottom) {
            return message.channel.send(`${message.author} ❌ The application has been cancelled:\n\n${masteryBottom}${geodeBottom}${powerrankBottom}`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // remove bot exit request message.
        }
    }

    function Question5(appReferral, nickName, trovePoints, geodePoints, powerRank) { // Other clubs question
        return message.reply("What other clubs are you associated with? [max 100 characters]\n(or type cancel to stop)")
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        if (!Answer.first().content) { // if answer has no message content aka attachment added or some shit like that.
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (Answer.first().content.length > 100) { // if answer is longer than 100 characters
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is too long.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        return setTimeout(() => {
                            Question6(appReferral, nickName, trovePoints, geodePoints, powerRank, Answer.first().content);
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question5()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question6(appReferral, nickName, trovePoints, geodePoints, powerRank, otherClubs) { // Upload character sheet screenshot
        return message.reply("Please upload a screenshot of the character sheet now.\nMake sure your file is saved as one of the following extensions: **PNG**, **JPG**, **GIF**, **JPEG**\nExample as shown: https://i.imgur.com/ejao9la.png\n(or type anything to stop)")
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                        if (!Answer.first().attachments.array()[0]) { // if there is not attachment
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Attachment not found.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        const appImageUrl = Answer.first().attachments.array()[0].url;
                        if (appImageUrl.toLocaleLowerCase().endsWith('png') || appImageUrl.toLocaleLowerCase().endsWith('jpg') || appImageUrl.toLocaleLowerCase().endsWith('gif') || appImageUrl.toLocaleLowerCase().endsWith('jpeg')) {
                            const applicantUploadMessage = Answer.first();
                            return setTimeout(() => {
                                appPreview(appReferral, nickName, trovePoints, geodePoints, powerRank, otherClubs, appImageUrl, applicantUploadMessage);
                            }, 1000);
                        } else {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - wrong image format, allowed files: png, jpg, gif or jpeg.`)
                                .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // remove bot exit request message.
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question6()\nError when user answer the question.`, error);
                    });
            });
    }

    async function appPreview(appReferral, nickName, trovePoints, geodePoints, powerRank, otherClubs, appImageUrl, appImageMessage) { // Application preview
        // Create the attachment using MessageAttachment
        const attachment = new Discord.MessageAttachment(appImageUrl);

        let appStorageMessage = await appStorageChannel.send(`${message.author.id} | An image storage request for the ${message.author}'s application.`, attachment)
            .catch(error => {
                message.channel.send(`An unknown error occured ;(`)
                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                appImageMessage.delete({ timeout: 500 }).catch(() => { return });
                errorLog(`apply.js:1 appPreview()\nError to send message in a storage channel.`, error);
            });

        if (appStorageMessage) {
            let appStorageImageURL = appStorageMessage.attachments.array()[0].url;
            // define the embed: send application preview with provided information
            let embed_application_post_preview = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setAuthor('Application Preview', LaezariaIconURL)
                .setDescription(`${message.author}, There is your application preview ${nickName}\n\nMake sure everything is correct and react with ✅ emoji to proceed.\nIf you made a mistake or would like to edit your application, react with ❌ to cancel and try again.`)
                .addFields(
                    { name: 'Trove IGN', value: '► `' + nickName + '`', inline: false },
                    { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${trovePoints.toLocaleString()}\n► Geode Mastery Points: ${geodePoints.toLocaleString()}\n► Highest Power Rank: ${powerRank.toLocaleString()}`, inline: false },
                    { name: 'Other clubs', value: `► ${otherClubs}`, inline: false },
                    { name: 'Referral', value: `► ${appReferral}`, inline: false },
                )
                .setThumbnail(appStorageImageURL)

            let appImageMessageRemoved = await appImageMessage.delete().catch(() => { return });
            if (appImageMessageRemoved) {
                return message.channel.send(embed_application_post_preview)
                    .then((previewMessage) => { previewConfirmation(appReferral, previewMessage, message.author, nickName, trovePoints, geodePoints, powerRank, otherClubs, appStorageImageURL, appStorageMessage, appChannel); })
            }
        }
    }

    async function previewConfirmation(appReferral, previewMessage, applicationAuthor, nickName, trovePoints, geodePoints, powerRank, otherClubs, appStorageImageURL, appStorageMessage, appChannel) { // Application preview confirmation (emoji)

        try {
            await previewMessage.react('✅');
            await previewMessage.react('❌');
        } catch (error) {
            message.channel.send(`An unknown error occured ;(`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
            previewMessage.delete().catch(() => { return });
            appStorageMessage.delete().catch(() => { return });
            errorLog(`apply.js:1 previewConfirmation()\nError to add reactions probably wrong emojis.`, error)
        }

        const emojiFilter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && applicationAuthor === user;
        }

        previewMessage.awaitReactions(emojiFilter, { max: 1, time: 180000 })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '✅') {
                    return previewMessage.delete().catch(() => { return })
                        .then(() => {
                            return setTimeout(() => {
                                postApplication(appReferral, nickName, trovePoints, geodePoints, powerRank, otherClubs, appStorageImageURL, appStorageMessage, appChannel);
                            }, 1000);
                        })
                }

                if (reaction.emoji.name === '❌') {
                    return message.channel.send(`${message.author} ❌ Cancelling on user request...`)
                        .then((message) => {
                            message.delete({ timeout: 5000 }).catch(() => { return });
                            previewMessage.delete().catch(() => { return });
                            appStorageMessage.delete().catch(() => { return });
                        });
                }
            })
            .catch(error => {
                if (error.message === "Cannot read property 'emoji' of undefined") return message.channel.send(`${message.author} ❌ There was no reaction within the time limit (3mins)! - cancelling...`)
                    .then(message => {
                        message.delete({ timeout: 30000 }).catch(() => { return });
                        previewMessage.delete().catch(() => { return });
                        appStorageMessage.delete().catch(() => { return });
                    }); // remove bot info about time ran out

                removeUserLastMessage(message.author); // remove after user typed answer
                errorLog(`apply.js:2 previewConfirmation()\nError when user answer the question.`, error);
            });
    }

    async function postApplication(appReferral, nickName, trovePoints, geodePoints, powerRank, otherClubs, appStorageImageURL, appStorageMessage, appChannel) { // Post application
        let totalMasteryPoints = Math.round(trovePoints + geodePoints);
        // define the embed: send application with provided information
        let embed_application_post = new Discord.MessageEmbed()
            .setColor(embedColors.ClubApplications)
            .setAuthor(`Laezaria Application: ${nickName}`, LaezariaIconURL)
            .addFields(
                { name: 'Trove IGN', value: '► `' + nickName + '`', inline: false },
                { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${trovePoints.toLocaleString()}\n► Geode Mastery Points: ${geodePoints.toLocaleString()}\n► Total Mastery Points: ${totalMasteryPoints.toLocaleString()}\n► Highest Power Rank: ${powerRank.toLocaleString()}`, inline: false },
                { name: 'Other clubs', value: `► ${otherClubs}`, inline: false },
                { name: 'Referral', value: `► ${appReferral}`, inline: false },
                { name: 'Screenshot:', value: `${appStorageImageURL}`, inline: false },
                { name: 'Applicant information', value: `Mention: _${message.author}_\nTag: _${message.author.tag}_`, inline: false },
                { name: 'ID', value: `${message.author.id}`, inline: false },
            )
            .setThumbnail(appStorageImageURL)
            .setFooter(`Club Members(👍👎) and Captains(🍏🍎) can vote for this application with emojis.`)

        let applicationSent = await appChannel.send(embed_application_post)
            .catch(error => {
                message.channel.send(`An unknown error occured ;(`)
                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                appStorageMessage.delete().catch(() => { return });
                errorLog(`apply.js:1 postApplication()\nError send an application.`, error);
            });

        if (applicationSent) {
            renameApplicant(message.member, nickName);

            // define the embed: send application with provided information
            let embed_application_post_confirmation = new Discord.MessageEmbed()
                .setColor('ORANGE')
                .setAuthor('Laezaria - Application System', LaezariaIconURL)
                .setDescription(`${message.author}, Your application has been posted!\n[**Click here to see your message**](${applicationSent.url})`)
                .setFooter(`There will be a window of at least 24 hours after you have applied.\nA time where our members and captains will vote on your application.`)

            message.channel.send(embed_application_post_confirmation)
                .then(message => message.delete({ timeout: 20000 }).catch(() => { return }))
                .catch(error => errorLog(`apply.js:2 postApplication()\nError to send application message post.`, error));
            appStorageMessage.edit(`${message.author.id} | An image storage request for the ${message.author}'s application.\n${applicationSent.url}`);

            // console.log(applicationSent);
            try {
                await applicationSent.react('👍'); // Member positive reaction
                await applicationSent.react('👎'); // Member negative reaction
                await applicationSent.react('🍏'); // Captain posotive reaction
                await applicationSent.react('🍎'); // Captain negative reaction
            } catch (error) { errorLog(`apply.js:3 postApplication()\nError to add reactions probably missing ADD_REACTIONS or emojis are wrong.`, error) }
        }
    }

    function renameApplicant(applicantGuildMember, nickname) { // Rename applicant
        // console.warn(applicantGuildMember);
        applicantGuildMember.setNickname(nickname, 'Laezaria Application System')
            // .then(changed => { console.warn(`${applicantGuildMember.user.tag} nickname changed to: Test`) })
            .catch(error => errorLog(`apply.js:1 renameApplicant()\nError to rename applicant.\n${applicantGuildMember.user.tag} ID:${applicantGuildMember.id}`, error));
    }
}