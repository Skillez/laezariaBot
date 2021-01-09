const { Discord, errorLog, removeUserLastMessage } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "emoji",
    description: "Request emoji system.",
    type: "public",
    usage: "Type the command and follow instructions."
};

module.exports.run = async (bot, message) => {

    if (message.channel.id != config.other.emojiRequestChannelID) {
        return message.reply(`You can only request on the <#${config.other.emojiRequestChannelID}> channel!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
    }

    if (message.member.roles.cache.some(role => role.id === config.roles.guestRoleID))
        return message.reply(`Guests cannot request emojis!\nCheck out the <#${config.channels.informationChannelID}> to learn more.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    const emojiRequestChannel = message.guild.channels.cache.find(ch => ch.id === config.other.emojiRequestChannelID);

    if (emojiRequestChannel) {
        const emojiRequestChannelReadMessagesCheck = await emojiRequestChannel.messages.fetch({ limit: 1 }).catch(() => { return });

        if (!emojiRequestChannelReadMessagesCheck) {
            errorLog(`emoji.js:1\nNot enough permissions for the #${emojiRequestChannel.name} channel.\n[READ_MESSAGES]`, undefined)
            return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
        }

        if (!emojiRequestChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) { // requirement for emoji channel
            errorLog(`emoji.js:2 Not enough permissions for the #${emojiRequestChannel.name} channel.\n[SEND_MESSAGES - EMBED_LINKS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
            return message.reply(`Missing ${bot.user} bot permissions, contact discord admin to fix that issue.`).then(message => { message.delete({ timeout: 10000 }) });
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    const filter = m => m.author.id === message.author.id;


    return message.reply("Please enter emoji request type.\n```less\n[1] add\n[2] delele```\n(or type cancel to stop)")
        .then(RequestTypeQuestion => {
            message.channel.awaitMessages(filter, { max: 1, time: 60000 })
                .then(RequestTypeAnswer => {
                    RequestTypeQuestion.delete().catch(() => { return }); // remove bot request type after answer
                    if (RequestTypeAnswer.first().content.startsWith(config.botPrefix)) return; // stop the request if other command was typed

                    if (RequestTypeAnswer.first().content.toLowerCase() === 'add' || RequestTypeAnswer.first().content.toLowerCase() === '1') {
                        removeUserLastMessage(message.author); // remove after user typed add
                        return setTimeout(() => {
                            QuestionAdd1();
                        }, 1000);
                    }
                    else if (RequestTypeAnswer.first().content.toLowerCase() === 'delete' || RequestTypeAnswer.first().content.toLowerCase() === 'del' || RequestTypeAnswer.first().content.toLowerCase() === '2') {
                        removeUserLastMessage(message.author); // remove after user typed del
                        return setTimeout(() => {
                            QuestionDel1();
                        }, 1000);
                    }
                    else { // if something else than add was typed
                        removeUserLastMessage(message.author); // something else was typed and remove user answer

                        return message.channel.send(`${message.author} ❌ Cancelling...`)
                            .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message
                    }

                }).catch(error => {
                    if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (1min)! - cancelling...`)
                        .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                    removeUserLastMessage(message.author); // remove after user typed an answer
                    errorLog(`emoji.js:1 Emoji Request Type Question\nError when user answer the request type question.`, error);
                });
        });


    function QuestionAdd1() {
        return message.reply(`Enter emoji name for your request. [2-20 characters][only alphanumeric][unique name]\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 60000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop emoji request if other command was typed

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (Answer.first().content.length < 2) { // if answer is shorter than 2 characters
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - emoji name is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (Answer.first().content.length > 20) { // if answer is longer than 20 characters
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - emoji name is too long.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (!Answer.first().content.match(/^[a-zA-Z0-9]+$/)) {
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - typed non-alphanumeric characters.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === Answer.first().content.toLowerCase())) {
                            const emojiExist = message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === Answer.first().content.toLowerCase())
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - your request is not unique, ${emojiExist} is found with that name.`)
                                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
                        }

                        else {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return setTimeout(() => {
                                QuestionAdd2(Answer.first().content);
                            }, 1000);
                        }
                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (1min)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out
                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`emoji.js:1 QuestionAdd1()\nError when user answer the question.`, error);
                    });
            });
    }

    function QuestionAdd2(EmojiName) {
        return message.reply(`Upload emoji file: [PNG, JPEG, JPG, GIF] Emoji must be under 256kb in size and square e.g: 32x32, 64x64\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 60000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop the request if other command was typed

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message - ready check
                        }

                        else if (!Answer.first().attachments.first()) { // if there is not attachment
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - attachment not found.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // remove bot exit request message.
                        }

                        // const EmojiRequestImageURL = Answer.first().attachments.first().url;
                        else if (Answer.first().attachments.first().url.toLowerCase().endsWith('png') || Answer.first().attachments.first().url.toLowerCase().endsWith('jpg') || Answer.first().attachments.first().url.toLowerCase().endsWith('gif') || Answer.first().attachments.first().url.toLowerCase().endsWith('jpeg')) {
                            // console.warn(`name:`, EmojiName)
                            // console.warn(`url:`, Answer.first().attachments.first().url);
                            // console.warn(`height:`, Answer.first().attachments.first().height);
                            // console.warn(`width:`, Answer.first().attachments.first().width);
                            // console.warn(`size:`, Answer.first().attachments.first().size);
                            // console.log(`---------------------------`);

                            if (Answer.first().attachments.first().size > 256000 || Answer.first().attachments.first().height != Answer.first().attachments.first().width) {
                                removeUserLastMessage(message.author); // remove user incorect emoji request
                                return message.reply(`Emoji doesn't meet the requirements.\nMake sure your file is under 256kb in size and square.`)
                                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // remove bot reply message.
                            } else return setTimeout(() => {
                                EmojiRequestFunc(EmojiName, Answer.first().attachments.first().url, Answer.first(), "add");
                            }, 1000);

                        } else {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - wrong image format, allowed files: png, jpg, gif or jpeg.`)
                                .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // remove bot exit request message.
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (1min)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`emoji.js:1 QuestionAdd2()\nError when user answer the question.`, error);
                    });
            });
    }

    function QuestionDel1() {
        return message.reply(`Enter emoji name for your delete request. [2-20 characters][only alphanumeric]\n(or type cancel to stop)`)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 60000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return }); // remove bot question after answer is sent
                        if (Answer.first().content.startsWith(config.botPrefix)) return; // stop emoji request if other command was typed

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') { // if user want to stop
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Cancelling...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (Answer.first().content.length < 2) { // if answer is shorter than 2 characters
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - emoji name is too short.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (Answer.first().content.length > 20) { // if answer is longer than 20 characters
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - emoji name is too long.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (!Answer.first().content.match(/^[a-zA-Z0-9]+$/)) {
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - non alphanumeric characters typed.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (Answer.first().content.toLowerCase() === "yeah"
                            || Answer.first().content.toLowerCase() === "nay"
                            || Answer.first().content.toLowerCase() === "laezaria"
                            || Answer.first().content.toLowerCase() === "loading"
                            || Answer.first().content.toLowerCase() === "wf"
                            || Answer.first().content.toLowerCase() === "csgo"
                            || Answer.first().content.toLowerCase() === "lol"
                            || Answer.first().content.toLowerCase() === "destiny") {
                            removeUserLastMessage(message.author);
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - You can't request a deletion for this emoji.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        else if (message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === Answer.first().content.toLowerCase())) {
                            removeUserLastMessage(message.author);
                            return setTimeout(() => {
                                EmojiRequestFunc(Answer.first().content, undefined, Answer.first(), "del");
                            }, 1000);
                        }

                        else {
                            removeUserLastMessage(message.author); // remove after user typed answer
                            return message.channel.send(`${message.author} ❌ Emoji request has been cancelled - emoji **${Answer.first().content}** is not found on this server.`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }
                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${message.author} ❌ There was no message within the time limit (1min)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return }); // remove bot info about time ran out

                        removeUserLastMessage(message.author); // remove after user typed answer
                        errorLog(`emoji.js:1 QuestionAdd1()\nError when user answer the question.`, error);
                    });
            });
    }

    async function EmojiRequestFunc(EmojiName, EmojiURL, EmojiRequestMessage, requestType) {
        switch (requestType) {
            case "add": {
                const attachment = new Discord.MessageAttachment(EmojiURL);
                return await message.channel.send(`> 🟩 New emoji request from ${message.author}\nName: **${EmojiName}**`, attachment)
                    .then(message => {
                        message.react('✅').catch(() => { return });
                        // const lastword = message.content.split(" ").pop();
                        // console.log(lastword);
                        // console.log(message.attachments.first().url);
                    })
                    .then(() => { EmojiRequestMessage.delete().catch(() => { return }); })
                    .catch(() => { errorLog(`emoji.js:1 EmojiRequestFunc()\nError with the function - '${requestType}'`, error) });
            }
            case "del": {
                const emojiDeleteRequest = message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === EmojiName.toLowerCase())
                const attachment = new Discord.MessageAttachment(emojiDeleteRequest.url);
                return await message.channel.send(`> 🟥 Delete emoji request from ${message.author}\nName: **${emojiDeleteRequest.name}**`, attachment)
                    .then(message => {
                        message.react('✅').catch(() => { return });
                        // const lastword = message.content.split(" ").pop();
                        // console.log(lastword);
                        // console.log(message.attachments.first().url);
                    })
                    .catch(() => { errorLog(`emoji.js:2 EmojiRequestFunc()\nError with the function  - '${requestType}'`, error) });
            }
            default:
                return errorLog(`emoji.js:3 EmojiRequestFunc()\nError with the function - '${requestType}'`, error)
        }
    }
}