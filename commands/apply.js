const { Discord, LaezariaIconURL, errorLog, removeUserLastMessage, sendEmbedLog, embedColors, botPermission } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "apply",
    description: "The official way to join our club with an interactive system.",
    type: "public",
    usage: "Type the command and follow instructions."
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                  interactive application                                 //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (message.channel.id != config.Application_ProcessChannelID) {
        return message.reply(`You can only apply on the <#${config.Application_ProcessChannelID}> channel!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
    }

    if (message.member.roles.cache.some(role => role.id === config.GuestRoleID))
        return message.reply(`Hello!\nThank you for your interest to join **${bot.guilds.cache.get(config.LaezariaServerID).name}** <:laezaria:582281105298817032>\nUnfortunately, you can't apply at the moment.\nPlease take some time to familiarise yourself with our <#${config.InformationChannelID}> channel before you proceed to send an application.`)
            .then(message => message.delete({ timeout: 20000 })).catch(() => { return });

    if (message.member.roles.cache.some(role => role.id === config.MemberRoleID))
        return message.reply(`Hello!\nIt seems that you are an ex-member of the club, if you would like to rejoin the club, please contact any of our club's staffs (senpai, manager).`)
            .then(message => message.delete({ timeout: 20000 })).catch(() => { return });

    if (message.member.roles.cache.some(role => role.id === config.Application_RestrictionRoleID))
        return message.reply(`You are banned from using this command.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });


    //////////////////////////////////////////////////////////////////////////////////////////////

    const appChannel = message.guild.channels.cache.find(ch => ch.id === config.Application_ChannelID);
    const appStorageChannel = message.guild.channels.cache.find(ch => ch.id === config.Application_StorageChannelID);
    const appProcessChannel = message.guild.channels.cache.find(ch => ch.id === config.Application_ProcessChannelID);

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
        return sendEmbedLog(embed_application_missing_channels, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
    }

    if (!appChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) { // requirement for application channel
        errorLog(`apply.js:2 Not enough permissions for the #${appChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    if (!appStorageChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'])) { // requirement for application storage channel
        errorLog(`apply.js:3 Not enough permissions for the #${appStorageChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ATTACH_FILES - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    if (!appProcessChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) { // requirement for application storage channel
        errorLog(`apply.js:4 Not enough permissions for the #${appProcessChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    if (!botPermission('MANAGE_NICKNAMES')) {
        errorLog(`apply.js:5 Not enough permissions for the application system [MANAGE_NICKNAMES].`, undefined)
        return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    const filter = m => m.author.id === message.author.id;

    return message.reply("Before we proceed forward, make sure you have the values for these stats.\n**Note:** Contact the discord manager if you are experiencing any errors with the command.\n\nWhat do you need?\n```less\n[1] Trove Mastery Points (exact number from the leaderboard)\n[2] Geode Mastery Points (exact number from the leaderboard)\n[3] Highest Class Power Rank (exact number)\n[4] Screenshot with visible character sheet (C)```Example: https://skillez.eu/images/discord/app.png\n\nWe strongly recommend to use **Enhanced UI Mod** which is available on Trovesaurus and Steam Workshop.\n\nIf you're ready, then type **ready** or __anything else__ to abandon this application.")
        .then(ReadyQuestion => {
            message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                .then(ReadyAnswer => {
                    ReadyQuestion.delete().catch(() => { return }); // remove bot ready check after answer
                    if (ReadyAnswer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

                    if (ReadyAnswer.first().content.toLowerCase() === 'ready') {
                        removeUserLastMessage(message.author); // remove after user typed ready
                        setTimeout(() => {
                            return Question1();
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

    function Question1() {
        // return message.reply("What's your trove **in-game name**?\n(or type cancel to stop)")
        return message.channel.send(`Alright, ${message.author} let's start with something easy, what is your **in-game name**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

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
                        // let Answer1 = Answer.first().content;
                        setTimeout(() => {
                            return Question2(Answer.first().content);
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question1()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question2(Answer1) {
        return message.reply(`Hey ${Answer1}, what is your **TROVE Mastery Points**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

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

                        let replaceAnswer2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replaceAnswer2Number) === true) { // if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer2Number > 150000) { // if answer is above 150,000 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your Trove Mastery Points are too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer2Number < 69200) { // if answer is below 69200 points (500 mastery)
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your **Trove Mastery Points** are below our requirements.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        // let Answer2 = Answer.first().content;
                        setTimeout(() => {
                            return Question3(Answer1, Number(replaceAnswer2Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question2()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question3(Answer1, Answer2) {
        return message.reply(`What is your **GEODE Mastery Points**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

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

                        let replaceAnswer3Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replaceAnswer3Number) === true) { // if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer3Number > 20000) { // if answer is above 20,000 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your Geode Mastery Points are too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer3Number < 4100) { // if answer is below 4,100 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your **Geode Mastery Points** are below our requirements.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        // let Answer2 = Answer.first().content;
                        setTimeout(() => {
                            return Question4(Answer1, Answer2, Number(replaceAnswer3Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question3()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question4(Answer1, Answer2, Answer3) {
        return message.reply(`What is your **highest Power Rank**?\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

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

                        let replaceAnswer4Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                        if (isNaN(replaceAnswer4Number) === true) { //if answer is not a number
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your answer is not a number.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer4Number > 45000) { // if answer is above 45,000 points
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your highest Power Rank is too high.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        if (replaceAnswer4Number < 30000) { // if answer is below a number 30000
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Your **highest Power Rank** is below our requirements.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        removeUserLastMessage(message.author); // remove after user typed answer
                        // let Answer3 = Answer.first().content;
                        setTimeout(() => {
                            return Question5(Answer1, Answer2, Answer3, Number(replaceAnswer4Number));
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question4()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question5(Answer1, Answer2, Answer3, Answer4) {
        return message.reply("What other clubs are you associated with? [max 100 characters]\n(or type cancel to stop)")
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

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
                        // let Answer4 = Answer.first().content;
                        setTimeout(() => {
                            return Question6(Answer1, Answer2, Answer3, Answer4, Answer.first().content);
                        }, 1000);

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (3mins)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`apply.js:1 Question5()\nError when user answer the question.`, error);
                    });
            });
    }

    function Question6(Answer1, Answer2, Answer3, Answer4, Answer5) {
        return message.reply("Please upload a screenshot of the character sheet now.\nMake sure your file is saved as one of the following extensions: **PNG**, **JPG**, **GIF**, **JPEG**\nExample as shown: https://skillez.eu/images/discord/app.png\n(or type anything to stop)")
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.BotPrefix)) return; // stop the application if other command was typed

                        if (!Answer.first().attachments.array()[0]) { // if there is not attachment
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ The application has been cancelled - Attachment not found.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        const appImageUrl = Answer.first().attachments.array()[0].url;
                        if (appImageUrl.toLocaleLowerCase().endsWith('png') || appImageUrl.toLocaleLowerCase().endsWith('jpg') || appImageUrl.toLocaleLowerCase().endsWith('gif') || appImageUrl.toLocaleLowerCase().endsWith('jpeg')) {
                            const applicantUploadMessage = Answer.first();
                            setTimeout(() => {
                                return appPreview(Answer1, Answer2, Answer3, Answer4, Answer5, appImageUrl, applicantUploadMessage);
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

    async function appPreview(Answer1, Answer2, Answer3, Answer4, Answer5, appImageUrl, appImageMessage) {
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
                .setDescription(`${message.author}, There is your application preview ${Answer1}\n\nMake sure everything is correct and react with ✅ emoji to proceed.\nIf you made a mistake or would like to edit your application, react with ❌ to cancel and try again.`)
                .addFields(
                    { name: 'Trove IGN', value: '► `' + Answer1 + '`', inline: false },
                    { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${Answer2.toLocaleString()}\n► Geode Mastery Points: ${Answer3.toLocaleString()}\n► Highest Power Rank: ${Answer4.toLocaleString()}`, inline: false },
                    { name: 'Other clubs', value: `► ${Answer5}`, inline: false },
                )
                .setThumbnail(appStorageImageURL)

            let appImageMessageRemoved = await appImageMessage.delete().catch(() => { return });
            if (appImageMessageRemoved) {
                return message.channel.send(embed_application_post_preview)
                    .then((previewMessage) => { previewConfirmation(previewMessage, message.author, Answer1, Answer2, Answer3, Answer4, Answer5, appStorageImageURL, appStorageMessage, appChannel); })
            }
        }
    }

    async function previewConfirmation(previewMessage, applicationAuthor, Answer1, Answer2, Answer3, Answer4, Answer5, appStorageImageURL, appStorageMessage, appChannel) {

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
                            setTimeout(() => {
                                return postApplication(Answer1, Answer2, Answer3, Answer4, Answer5, appStorageImageURL, appStorageMessage, appChannel);
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

    async function postApplication(Answer1, Answer2, Answer3, Answer4, Answer5, appStorageImageURL, appStorageMessage, appChannel) {
        let totalMasteryPoints = Math.round(Answer2 + Answer3);
        // define the embed: send application with provided information
        let embed_application_post = new Discord.MessageEmbed()
            .setColor(embedColors.ClubApplications)
            .setAuthor(`Laezaria Application: ${Answer1}`, LaezariaIconURL)
            .addFields(
                { name: 'Trove IGN', value: '► `' + Answer1 + '`', inline: false },
                { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${Answer2.toLocaleString()}\n► Geode Mastery Points: ${Answer3.toLocaleString()}\n► Total Mastery Points: ${totalMasteryPoints.toLocaleString()}\n► Highest Power Rank: ${Answer4.toLocaleString()}`, inline: false },
                { name: 'Other clubs', value: `► ${Answer5}`, inline: false },
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
            renameApplicant(message.member, Answer1);

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

    function renameApplicant(applicantGuildMember, nickname) {
        // console.warn(applicantGuildMember);
        applicantGuildMember.setNickname(nickname, 'Laezaria Application System')
            // .then(changed => { console.warn(`${applicantGuildMember.user.tag} nickname changed to: Test`) })
            .catch(error => errorLog(`apply.js:1 renameApplicant()\nError to rename applicant.\n${applicantGuildMember.user.tag} ID:${applicantGuildMember.id}`, error));
    }
}