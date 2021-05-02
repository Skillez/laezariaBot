const { Discord, LaezariaIconURL, errorLog, removeUserLastMessage, embedColors, botReply, embedMessage, getEmoji, sendEmbedLog } = require('../app');
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

    const responseTime = 600000;
    let applicantNickname = 'ERROR';
    let refferalMention = 'None';
    let troveMastery = 'ERROR';
    let geodeMastery = 'ERROR';
    let powerRank = 'ERROR';
    let otherClubs = 'None';

    let feedbackRate = 0;
    let feedbackText = 'ERROR';
    let applicationURL;

    //////////////////////////////////////////////////////////////////////////////////////////////

    const appChannel = message.guild.channels.cache.find(ch => ch.id === config.application.channelID);
    const appStorageChannel = message.guild.channels.cache.find(ch => ch.id === config.application.storageChannelID);
    const appProcessChannel = message.guild.channels.cache.find(ch => ch.id === config.application.processChannelID);

    if (!appChannel || !appStorageChannel || !appProcessChannel) return botReply(embedMessage(`❌ Wrong server configuration 🔧\nPlease, contact <@&${config.roles.discordManagerRoleID}> to fix this issue!`), message, 10000, true, false, false);

    //////////////////////////////////////////////////////////////////////////////////////////////

    if (message.channel.id != config.application.processChannelID) // Block the command outside application channel.
        return botReply(embedMessage(`You can only apply on the <#${config.application.processChannelID}> channel!`, message.author), message, 10000, true);

    else if (message.member.roles.cache.some(role => role.id === config.roles.guestRoleID)) // Questions to guests
        return guestQuestion();

    else if (message.member.roles.cache.some(role => role.id === config.roles.memberRoleID)) // If applicant has member role
        return botReply(embedMessage(`Hello!\nIt seems that you are an ex-member of the club.\nIf you would like to rejoin, please contact any of our club's staffs.\n\n• <@&${config.roles.captainRoleID}>\n• <@&${config.roles.managerRoleID}>\n• <@&${config.roles.viceRoleID}>\n• <@&${config.roles.senpaiRoleID}>`, message.author), message, 30000, true);

    else if (message.member.roles.cache.some(role => role.id === config.application.restrictionRoleID)) // If applicant is banned aka has restriction role
        return botReply(embedMessage(`You are banned from using this command.`, message.author), message, 20000, true);

    else initialQuestion(); // runs the first question

    //////////////////////////////////////////////////////////////////////////////////////////////

    function initialQuestion() {
        return botReply("Before we proceed forward, make sure you have the values for these stats.\n**Note:** Contact the discord manager if you are experiencing any errors with the command.\n\nWhat do you need?\n```less\n[1] Trove Mastery Points (exact number from the leaderboard)\n[2] Geode Mastery Points (exact number from the leaderboard)\n[3] Highest Class Power Rank (exact number)\n[4] Screenshot with visible character sheet (C) [example below]```\nWe strongly recommend to use **Enhanced UI Mod** which is available on Trovesaurus and Steam Workshop.\n\nIf you're ready, then type **ready** or __anything else__ to abandon this application.\nYou can also type **exit** to cancel the application at any time.", message, 0, false, null, './images/application/application.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 initialQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            switch (Answer.first().content.toLowerCase()) {
                                case 'ready': {
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { nicknameQuestion() }, 1000); // go to the nickname question
                                }

                                default: {
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                                }
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 initialQuestion() Error`, error);
            });
    }

    function guestQuestion() {
        return botReply(embedMessage(`Did you read <#${config.channels.informationChannelID}> channel and you aware of our guidelines/rules?`, message.author), message, 0, false)
            .then(async Question => {

                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && message.author === user;
                    }

                    Question.awaitReactions(emojiFilter, { max: 1, time: responseTime })
                        .then(collected => {
                            const reaction = collected.first();
                            Question.delete().catch(error => console.error(`apply.js:1 guestQuestion() Error to delate the message`, error)); // Delete bot's question

                            switch (reaction.emoji.name) {
                                case '✅': return setTimeout(() => { botReply(`Why do you have a guest role then? 🤔\nGo to the <#${config.channels.informationChannelID}> channel, read how to get rid of this role and try again.`, message, 20000, true); }, 1000);
                                case '❌': return setTimeout(() => { botReply(`Well, at least you are honest with us 👌\nPlease go to the <#${config.channels.informationChannelID}> channel, read how to remove a guest role from your account and try again ;)`, message, 20000, true); }, 1000);
                                default: return;
                            }
                        })
                        .catch(error => {
                            if (error.message === "Cannot read property 'emoji' of undefined") return botReply(`❌ There was no reaction within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            errorLog(`apply.js:2 guestQuestion() Error when user answer the question.`, error);
                        });

                    try {
                        await Question.react('✅');
                        await Question.react('❌');
                    } catch (error) {
                        if (error.message === 'Unknown Message') return;
                        botReply(`An unknown error occured ;(`, message, 10000, true);
                        errorLog(`apply.js:2 guestQuestion() Error to add reactions probably wrong emojis or missing permission.`, error);
                    }
                }
            }).catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:3 guestQuestion() Error`, error);
            });
    }

    function nicknameQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> Alright let's start with something easy. **What's your in-game name?**`, message, 0, false, null, './images/application/nickname.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 nicknameQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.length < 3 || Answer.first().content.length > 20) { // Check nickname length
                                removeUserLastMessage(message.author); // remove user answer
                                return nicknameQuestion(`❌ Your nickname is either too short or too long.`);
                            }

                            switch (Answer.first().content.toLowerCase()) {
                                case 'exit': case 'cancel': {
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                                }

                                default: {
                                    applicantNickname = Answer.first().content;
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { return referralQuestion(); }, 1000); // go to the referral question
                                }
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 nicknameQuestion() Error`, error);
            });
    }

    function referralQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n';
        return botReply(`${additionalText}\n> **Have you been referred by our staff(enforcer+)?**`, message, 0, false)
            .then(async Question => {

                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && message.author === user;
                    }

                    Question.awaitReactions(emojiFilter, { max: 1, time: responseTime })
                        .then(collected => {
                            const reaction = collected.first();
                            Question.delete().catch(error => console.error(`apply.js:1 referralQuestion() Error to delate the message`, error)); // Delete bot's question

                            switch (reaction.emoji.name) {
                                case '✅': return setTimeout(() => { referralMentionQuestion(); }, 1000); // go to the referral mention question
                                case '❌': return setTimeout(() => { troveMasteryQuestion() }, 1000); // go to the trove mastery question
                                default: return;
                            }
                        })
                        .catch(error => {
                            if (error.message === "Cannot read property 'emoji' of undefined") return botReply(`❌ There was no reaction within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            errorLog(`apply.js:2 referralQuestion() Error when user answer the question.`, error);
                        });

                    try {
                        await Question.react('✅');
                        await Question.react('❌');
                    } catch (error) {
                        if (error.message === 'Unknown Message') return;
                        botReply(`An unknown error occured ;(`, message, 10000, true);
                        errorLog(`apply.js:4 referralQuestion() Error to add reactions probably wrong emojis or missing permission.`, error);
                    }
                }
            }).catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:5 referralQuestion() Error`, error);
            });

    }

    function referralMentionQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n'
        return botReply(`${additionalText}\n> **Please mention enforcer+ that referred you.**`, message, 0, false, false, './images/application/mention.gif')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 referralMentionQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            } else if (Answer.first().content.startsWith('<@') && Answer.first().content.endsWith('>')) {

                                const ReplaceMentionToID = Answer.first().content.replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
                                const referralGuildMember = message.guild.members.cache.get(ReplaceMentionToID); // check cache to find the mentioned user

                                if (referralGuildMember) { // check if mention is valid

                                    if (referralGuildMember.roles.cache.some(role => role.id === config.roles.senpaiRoleID)
                                        || referralGuildMember.roles.cache.some(role => role.id === config.roles.viceRoleID)
                                        || referralGuildMember.roles.cache.some(role => role.id === config.roles.managerRoleID)
                                        || referralGuildMember.roles.cache.some(role => role.id === config.roles.enforcerRoleID)) {
                                        refferalMention = referralGuildMember.user;
                                        removeUserLastMessage(message.author); // remove after user typed answer
                                        return setTimeout(() => { return troveMasteryQuestion(); }, 1000); // go to the trove points question

                                    } else {
                                        removeUserLastMessage(message.author); // remove after user typed answer
                                        return referralQuestion('❌ Your referral is not enforcer+.');
                                    }
                                } else {
                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    return referralQuestion('❌ Your referral is invalid.');
                                }
                            } else {
                                removeUserLastMessage(message.author); // remove user answer
                                return referralQuestion(`❌ You didn't mention referral.`);
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 referralMentionQuestion() Error`, error);
            });
    }

    function troveMasteryQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> **What's your TROVE Mastery Points?**`, message, 0, false, false, './images/application/trovePoints.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 troveMasteryQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            }

                            const replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                            if (isNaN(replace2Number) === true || !replace2Number) { // if answer is not a number
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return troveMasteryQuestion('❌ Your answer is not a number.');
                            }
                            else if (replace2Number >= 500000) { // Check TROVE mastery points - upper limit 500,000 points
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return troveMasteryQuestion('❌ Your Trove Mastery Points are too high!');
                            }
                            else if (replace2Number <= 1000) {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return troveMasteryQuestion('❌ Make sure to type your **POINTS** not a rank.');
                            }
                            else {
                                troveMastery = Number(replace2Number);
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return geodeMasteryQuestion(); }, 1000); // go to the geode points question
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 troveMasteryQuestion() Error`, error);
            });
    }

    function geodeMasteryQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> **What's your GEODE Mastery Points?**`, message, 0, false, false, './images/application/geodePoints.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 geodeMasteryQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            }

                            const replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                            if (isNaN(replace2Number) === true || !replace2Number) { // if answer is not a number
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return geodeMasteryQuestion('❌ Your answer is not a number!');
                            }
                            else if (replace2Number >= 500000) { // Check GEODE mastery points - upper limit 500,000 points
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return geodeMasteryQuestion('❌ Your Geode Mastery Points are too high!');
                            }
                            else if (replace2Number <= 100) {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return geodeMasteryQuestion('❌ Make sure sure to type your **POINTS** not a rank.');
                            }
                            else {
                                geodeMastery = Number(replace2Number);
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return powerRankQuestion(); }, 1000); // go to the power rank question
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 geodeMasteryQuestion() Error`, error);
            });
    }

    function powerRankQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> **What's your highest Power Rank?**`, message, 0, false, false, './images/application/powerRank.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 powerRankQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            }

                            const replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                            if (isNaN(replace2Number) === true || !replace2Number) { // if answer is not a number
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return powerRankQuestion('❌ Your answer is not a number.');
                            }
                            else if (replace2Number >= 99999) { // Check power rank - upper limit 99,999 points
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return powerRankQuestion('❌ Your Power Rank is too high!');
                            }
                            else if (replace2Number <= 100) {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return powerRankQuestion('❌ Your Power Rank is too low!');
                            }
                            else {
                                powerRank = Number(replace2Number);
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return requirementCheck(); }, 1000); // go to the requirement check function
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 powerRankQuestion() Error`, error);
            });
    }

    function requirementCheck() {
        let outputStringMessage = '';
        if (powerRank < config.requirements.powerRank) outputStringMessage = outputStringMessage + `• Your highest **Power Rank**(${powerRank.toLocaleString()}) is below our requirements(${config.requirements.powerRank.toLocaleString()}).\n`;
        else return otherClubsQuestion(); // go to the other clubs question

        if (troveMastery < config.requirements.trovePoints) outputStringMessage = outputStringMessage + `• **Trove Mastery Points**(${troveMastery.toLocaleString()}) are below our requirements(${config.requirements.trovePoints.toLocaleString()}).\n`;
        if (geodeMastery < config.requirements.geodePoints) outputStringMessage = outputStringMessage + `• **Geode Mastery Points**(${geodeMastery.toLocaleString()}) are below our requirements(${config.requirements.geodePoints.toLocaleString()}).\n`;

        if (outputStringMessage === '' || outputStringMessage === `• Your highest **Power Rank**(${powerRank.toLocaleString()}) is below our requirements(${config.requirements.powerRank.toLocaleString()}).\n`) return otherClubsQuestion(); // go to the other clubs question
        else return botReply(`**❌ Your application has been canceled**\nThank you for applying to ${getEmoji(message.guild.id, 'laezaria')}Laezaria.\nUnfortunately, your application has been rejected as you do not meet our minimum requirements.\n\n${outputStringMessage}\n Feel free to stay around our discord and reapply once you've met the requirements. We look forward to seeing you soon ${getEmoji(message.guild.id, 'peepoLove')}`, message, 60000, true, false, './images/application/underRequirements.gif');
    }

    function otherClubsQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> **What other clubs are you associated with?**\n[max 150 characters]`, message, 0, false, null, './images/application/otherClubs.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 otherClubsQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.length < 1 || Answer.first().content.length > 150) { // Check question length
                                removeUserLastMessage(message.author); // remove user answer
                                return otherClubsQuestion('❌ Your answer is either too short or too long.');
                            }

                            switch (Answer.first().content.toLowerCase()) {
                                case 'exit': case 'cancel': {
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                                }
                                default: {
                                    otherClubs = Answer.first().content;
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { return characterSheetScreenshot(); }, 1000); // go to the screenshot question
                                }
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 otherClubsQuestion() Error`, error);
            });
    }

    function characterSheetScreenshot(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel app)\n';
        return botReply(`${additionalText}\n> **Please upload a screenshot of the character sheet.**`, message, 0, false, null, './images/application/application.png')
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 characterSheetScreenshot() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            }

                            else if (Answer.first().attachments.array()[0]) { // check if answer has attachment
                                const appImageUrl = Answer.first().attachments.array()[0].url;
                                if (appImageUrl.toLocaleLowerCase().endsWith('png') || appImageUrl.toLocaleLowerCase().endsWith('jpg') || appImageUrl.toLocaleLowerCase().endsWith('gif') || appImageUrl.toLocaleLowerCase().endsWith('jpeg')) {
                                    return applicationPreview(Answer.first()); // go to the app preview
                                } else {
                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    return characterSheetScreenshot(`❌ Make sure your file is saved as one of the following extensions: PNG, JPG, GIF, JPEG!`);
                                }

                            } else {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return characterSheetScreenshot(`❌ You have to upload your character sheet.`);
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else console.error(`apply.js:2 characterSheetScreenshot() Error to delate the message`, error);
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:3 characterSheetScreenshot() Error`, error);
            });
    }

    async function applicationPreview(uploadMessage) {
        const attachment = new Discord.MessageAttachment(uploadMessage.attachments.array()[0].url);

        const appStorageMessage = await appStorageChannel.send(`${message.author.id} | An image storage request for the ${message.author}'s application.`, attachment)
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true, false, false);
                uploadMessage.delete({ timeout: 500 }).catch(error => console.error(`apply.js:1 applicationPreview() Error to delate the message`, error));
                errorLog(`apply.js:2 applicationPreview() Error to send message in a storage channel.`, error);
            });

        if (appStorageMessage) {
            uploadMessage.delete().catch(error => console.error(`apply.js:3 applicationPreview() Error to delate the message`, error));
            const appStorageImageURL = appStorageMessage.attachments.array()[0].url;

            const embed_application_post_preview = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setAuthor('Application Preview', LaezariaIconURL)
                .setDescription(`${message.author}, There is your application preview ${applicantNickname}!\n\nMake sure everything is correct and react with ✅ emoji to proceed.\nIf you made a mistake or would like to edit your application, react with ❌ to cancel and try again.`)
                .addFields(
                    { name: 'Trove IGN', value: '► `' + applicantNickname + '`', inline: false },
                    { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${troveMastery.toLocaleString()}\n► Geode Mastery Points: ${geodeMastery.toLocaleString()}\n► Highest Power Rank: ${powerRank.toLocaleString()}`, inline: false },
                    { name: 'Other clubs', value: `► ${otherClubs}`, inline: false },
                    { name: 'Referral', value: `► ${refferalMention}`, inline: false },
                )
                .setThumbnail(appStorageImageURL)

            return message.channel.send(embed_application_post_preview)
                .then((previewMessage) => { previewReactions(previewMessage, appStorageMessage, message.author); }) // run emoji functions
                .catch(error => console.error(`apply.js:4 applicationPreview() Error to send the message`, error));
        }
        else return;
    }

    async function previewReactions(Question, appStorageMessage, applicationAuthor) {

        if (Question) { // check if the bot message exists
            const emojiFilter = (reaction, user) => { // accept interaction only from the applicationAuthor with reactions defined below
                return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && applicationAuthor === user;
            }

            Question.awaitReactions(emojiFilter, { max: 1, time: responseTime })
                .then(collected => {
                    const reaction = collected.first();
                    Question.delete().catch(error => console.error(`apply.js:1 previewReactions() Error to delate the message`, error)); // Delete bot's question

                    switch (reaction.emoji.name) {
                        case '✅': return setTimeout(() => { postApplication(appStorageMessage); }, 1000); // go to the postApplication function
                        case '❌': return setTimeout(() => {
                            appStorageMessage.delete().catch(error => console.error(`apply.js:2 previewReactions() Error to delate the message`, error));
                            botReply(embedMessage('❌ Cancelling...', applicationAuthor), message, 5000, true);

                        }, 1000); // exit the application and clear storeImage
                        default: return;
                    }
                })
                .catch(error => {
                    appStorageMessage.delete().catch(error => console.error(`apply.js:3 previewReactions() Error to delate the message`, error));
                    if (error.message === "Cannot read property 'emoji' of undefined") return botReply(`❌ There was no reaction within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                    errorLog(`apply.js:4 previewReactions() Error when user answer the question.`, error);
                });

            try {
                await Question.react('✅');
                await Question.react('❌');
            } catch (error) {
                if (error.message === 'Unknown Message') return;
                botReply(`An unknown error occured ;(`, message, 10000, true);
                errorLog(`apply.js:5 previewReactions() Error to add reactions probably wrong emojis or missing permission.`, error);
            }
        }


    }

    async function postApplication(appStorageMessage) {
        const totalMasteryPoints = Math.round(troveMastery + geodeMastery);
        const appStorageImageURL = appStorageMessage.attachments.array()[0].url;

        // define the embed: send application with provided information
        const embed_application_post = new Discord.MessageEmbed()
            .setColor(embedColors.ClubApplications)
            .setAuthor(`Laezaria Application: ${applicantNickname}`, LaezariaIconURL)
            .addFields(
                { name: 'Trove IGN', value: '► `' + applicantNickname + '`', inline: false },
                { name: 'List your total mastery points and your class with the highest PR', value: `► Trove Mastery Points: ${troveMastery.toLocaleString()}\n► Geode Mastery Points: ${geodeMastery.toLocaleString()}\n► Total Mastery Points: ${totalMasteryPoints.toLocaleString()}\n► Highest Power Rank: ${powerRank.toLocaleString()}`, inline: false },
                { name: 'Other clubs', value: `► ${otherClubs}`, inline: false },
                { name: 'Referral', value: `► ${refferalMention}`, inline: false },
                { name: 'Screenshot:', value: `► [Click to view an image](${appStorageImageURL} 'Application Image')`, inline: false },
                { name: 'Applicant information', value: `Mention: _${message.author}_\nTag: _${message.author.tag}_`, inline: false },
                { name: 'ID', value: `${message.author.id}`, inline: false },
            )
            .setThumbnail(appStorageImageURL)
            .setFooter(`Club Members(👍👎) and Captains(🍏🍎) can vote for this application with emojis.`)

        const applicationSent = await appChannel.send(embed_application_post)
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true, false, false);
                appStorageMessage.delete().catch(() => console.error(`apply.js:1 postApplication() Error to delate the message.`, error));
                errorLog(`apply.js:2 postApplication() Error send an application.`, error);
            });

        if (applicationSent) {
            applicationURL = applicationSent.url;
            renameApplicant(message.member, applicantNickname);

            // define the embed: send application with provided information
            const embed_application_post_confirmation = new Discord.MessageEmbed()
                .setColor('ORANGE')
                .setAuthor('Laezaria - Application System', LaezariaIconURL)
                .setDescription(`${message.author}, Your application has been posted!\n[**Click here to see your message**](${applicationSent.url})`)
                .setFooter(`There will be a window of at least 24 hours after you have applied.\nA time where our members and captains will vote on your application.`)

            message.channel.send(`That's all, but if you would like to give us feedback about the application process, please react with ✅ or ❌ to exit without feedback.\n‏‏‎ ‎`, embed_application_post_confirmation)
                .then(messageApp => feedbackReactions(messageApp, message.author))
                .catch(error => errorLog(`apply.js:2 postApplication() Error to send application message post.`, error));
            appStorageMessage.edit(`${message.author.id} | An image storage request for the ${message.author}'s application.\n${applicationSent.url}`);

            try {
                await applicationSent.react('👍'); // Member positive reaction
                await applicationSent.react('👎'); // Member negative reaction
                await applicationSent.react('🍏'); // Captain posotive reaction
                await applicationSent.react('🍎'); // Captain negative reaction
            } catch (error) { errorLog(`apply.js:3 postApplication() Error to add reactions probably missing ADD_REACTIONS or emojis are wrong.`, error) }
        } else return;
    }

    async function feedbackReactions(Question, applicationAuthor) {

        if (Question) { // check if the bot message exists
            const emojiFilter = (reaction, user) => { // accept interaction only from the applicationAuthor with reactions defined below
                return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && applicationAuthor === user;
            }

            Question.awaitReactions(emojiFilter, { max: 1, time: 60000 })
                .then(collected => {
                    const reaction = collected.first();
                    Question.delete().catch(error => console.error(`apply.js:1 previewReactions() Error to delate the message`, error)); // Delete bot's question

                    switch (reaction.emoji.name) {
                        case '✅': return setTimeout(() => { return feedbackRatingQuestion(); }, 1000); // go to the feedback question
                        default: return;
                    }
                })
                .catch(error => {
                    if (error.message === "Cannot read property 'emoji' of undefined") return;
                    errorLog(`apply.js:4 previewReactions() Error when user answer the question.`, error);
                });

            try {
                await Question.react('✅');
                await Question.react('❌');
            } catch (error) {
                if (error.message === 'Unknown Message') return;
                botReply(`An unknown error occured ;(`, message, 10000, true);
                errorLog(`apply.js:5 previewReactions() Error to add reactions probably wrong emojis or missing permission.`, error);
            }
        }


    }

    function feedbackRatingQuestion(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> How satisfied are you with the application system? [1-10]\n**1** (Not satisfied at all) up to **10** (Very satisfied)`, message, 0, false, false, false)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 * 2 })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 feedbackRatingQuestion() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') {
                                removeUserLastMessage(message.author); // remove user answer
                                return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                            }

                            const replace2Number = Answer.first().content.replace(/[., ]/g, ""); // replace answer to number
                            if (isNaN(replace2Number) === true || !replace2Number) { // if answer is not a number
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return feedbackRatingQuestion('❌ Your answer is not a number (1-10 range).');
                            }
                            else if (replace2Number > 10) { // Check rating - upper limit 10 points
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return feedbackRatingQuestion('❌ Your rating is too high (10 maximum)!');
                            }
                            else if (replace2Number < 1) {
                                removeUserLastMessage(message.author); // remove after user typed answer
                                return feedbackRatingQuestion('❌ Your rating is too low (1 minimum)!');
                            }

                            feedbackRate = replace2Number;
                            switch (replace2Number) {
                                case '1': case '2': case '3': case '4': case '5': case '6': {

                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    return setTimeout(() => { feedbackOpinionQuestions(); }, 1000);
                                }
                                case '7': case '8': case '9': case '10': {
                                    removeUserLastMessage(message.author); // remove after user typed answer
                                    const embed_feedback_log = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle(`Club Application System - Feedback`)
                                        .addFields({ name: `Rating: ${feedbackRate}`, value: `[Application link](${applicationURL} 'Click to go to the application post')`, inline: false },
                                            { name: `User: ${message.author.tag}`, value: `${message.author}\nID: ${message.author.id}`, inline: false })
                                        .setFooter(`ApplyJS:2`)
                                        .setThumbnail(LaezariaIconURL)
                                        .setTimestamp()
                                    sendEmbedLog(embed_feedback_log, config.botlogs.channelID, 'Laezaria Bot - Feedback');
                                    return botReply(`Thank you for the feedback 💙`, message, 7000, true, false, false);
                                }
                                default: return;
                            }

                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (2mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 feedbackRatingQuestion() Error`, error);
            });
    }

    function feedbackOpinionQuestions(additionalText) {
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> Can you tell us what you would like to change to make the rating higher?\n[up to 2000 characters]`, message, 0, false, false, false)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: responseTime })
                        .then(Answer => {
                            Question.delete().catch(error => console.error(`apply.js:1 feedbackOpinionQuestions() Error to delate the message`, error)); // delete question if user answered
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the application if other command was typed

                            if (Answer.first().content.length < 1 || Answer.first().content.length > 2000) { // Check nickname length
                                removeUserLastMessage(message.author); // remove user answer
                                return feedbackOpinionQuestions(`❌ Your feedback is either too short or too long.`);
                            }

                            switch (Answer.first().content.toLowerCase()) {
                                case 'exit': case 'cancel': {
                                    removeUserLastMessage(message.author); // remove user answer
                                    return setTimeout(() => { return botReply(embedMessage('❌ Cancelling...', message.author), message, 5000, true); }, 1000);
                                }

                                default: {
                                    feedbackText = Answer.first().content;
                                    removeUserLastMessage(message.author); // remove user answer

                                    const embed_feedback_log = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle(`Club Application System - Feedback`)
                                        .setDescription(feedbackText)
                                        .addFields({ name: `Rating: ${feedbackRate}`, value: `[Application link](${applicationURL} 'Click to go to the application post')`, inline: false },
                                            { name: `User: ${message.author.tag}`, value: `${message.author}\nID: ${message.author.id}`, inline: false })
                                        .setFooter(`ApplyJS:1`)
                                        .setThumbnail(LaezariaIconURL)
                                        .setTimestamp()
                                    sendEmbedLog(embed_feedback_log, config.botlogs.channelID, 'Laezaria Bot - Feedback');
                                    return botReply(`Thank you for the feedback 💙`, message, 7000, true, false, false);
                                }
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message, 30000, true);
                            else return;
                        });
                } else return;
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact discord manager to fix this issue!`, message, 20000, true);
                errorLog(`apply.js:2 feedbackOpinionQuestions() Error`, error);
            });
    }

    function renameApplicant(applicantGuildMember, nickname) { // Rename applicant
        applicantGuildMember.setNickname(nickname, 'Laezaria Application System')
            .catch(error => errorLog(`apply.js:1 renameApplicant() Error to rename applicant.\n${applicantGuildMember.user.tag} ID:${applicantGuildMember.id}`, error));
    }

    function checkVariables() { // debug
        console.debug(`nickname: ${applicantNickname}`);
        console.debug(`referral: ${refferalMention}`);
        console.debug(`trovePoints: ${troveMastery}`);
        console.debug(`geodePoints: ${geodeMastery}`);
        console.debug(`powerRank: ${powerRank}`);
        console.debug(`otherClubs: ${otherClubs}`);
        console.debug(`feedbackRate: ${feedbackRate}`);
        console.debug(`feedbackText: ${feedbackText}`);
        console.debug(`applicationURL: ${applicationURL}`);
        console.debug(`----------------------------------------------`);
    }
}