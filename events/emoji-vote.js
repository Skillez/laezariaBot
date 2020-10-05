const { bot, Discord, errorLog, LaezariaIconURL, sendEmbedLog } = require('../app');
const config = require("../bot-settings.json");
const cron = require('node-cron');
const reactsAmount = 15;

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    EMOJI VOTE HANDLER                                    //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    // Update Leaderboard Message - https://crontab.guru/examples.html
    cron.schedule('0 20 * * 7', () => { // At 8:00PM on Sunday.
        // console.error('emoji-vote.js checkEmojiRequests()', currentUTCDate());
        checkEmojiRequests();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function currentUTCDate() {

        function pad2(number) {
            return (number < 10 ? '0' : '') + number;
        }

        function dayOfWeekAsString(dayIndex) {
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex] || '';
        }

        function MonthAsString(dayIndex) {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][dayIndex] || '';
        }

        function formatAMPM(date) {
            var hours = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        const date = new Date();
        // return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
        return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${formatAMPM(date)} UTC`;
    }

    async function requestHandler(message, requestType) {
        switch (requestType) {
            case '🟩': { // Create a new emoji from a url
                const emojiName = message.content.split(" ").slice(-1).toString().replace(/\*/g, '');
                return bot.guilds.cache.get(config.LaezariaServerID).emojis.create(message.attachments.first().url, emojiName)
                    .then(emoji => {
                        message.delete().catch(() => { return });
                        const embed_emoji_added = new Discord.MessageEmbed()
                            .setColor('GREEN')
                            .setAuthor(`Emoji System Log`, LaezariaIconURL)
                            .setDescription(`Emoji: ${emoji} **${emoji.name}**\nAdded by the community!`)
                            .setFooter(`LOG:ID emojiVoteJS_1`)
                            .setTimestamp()
                            .setThumbnail(emoji.url)
                        return sendEmbedLog(embed_emoji_added, config.BotLog_Minor_ChanneLID, 'Laezaria Bot - Minor Logs');
                    })
                    .catch(error => {
                        if (error.message.includes('Maximum number of emojis reached') || error.message.includes('Maximum number of animated emojis reached')) return; // console.log(`error: Maximum number of emojis reached`);
                        errorLog(`emoji-vote.js:1 requestHandler() error to add a new emoji`, error);
                    });
            }

            case '🟥': { // Delete a emoji
                const emojiName = message.content.split(" ").slice(-1).toString().replace(/\*/g, '');
                const emojiDeleteRequest = message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === emojiName.toLowerCase())
                message.delete().catch(() => { return });
                const embed_emoji_removed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setAuthor(`Emoji System Log`, LaezariaIconURL)
                    .setDescription(`Emoji: ${emojiDeleteRequest} **${emojiDeleteRequest.name}**\nRemoved by the community!`)
                    .setFooter(`LOG:ID emojiVoteJS_2`)
                    .setTimestamp()
                    .setThumbnail(emojiDeleteRequest.url)
                return sendEmbedLog(embed_emoji_removed, config.BotLog_Minor_ChanneLID, 'Laezaria Bot - Minor Logs')
                    .then(() => { bot.guilds.cache.get(config.LaezariaServerID).emojis.resolve(emojiDeleteRequest).delete() })
                    .catch(error => errorLog(`emoji-vote.js:2 requestHandler() error to remove a new emoji`, error));
            }

            default: { // Delete emojis from non-request messages
                message.reactions.cache.get('✅').remove();
                return message.reactions.cache.get(staffApprovedEmoji.id).remove();
            }
        }
    }

    function checkEmojiRequests() {
        // Get messages from the emoji-channel and filter by author.bot && ✅ reactions && verified by staff
        const emojiRequestChannel = bot.guilds.cache.get(config.LaezariaServerID).channels.cache.find(ch => ch.id === config.EmojiRequest_ChannelID);
        if (!emojiRequestChannel) return errorLog(`emoji-vote.js:1 checkEmojiRequests()\nemojiRequestChannel is not found.`);
        else if (!emojiRequestChannel.permissionsFor(bot.guilds.cache.get(config.LaezariaServerID).me).has(['MANAGE_MESSAGES', 'MANAGE_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']))  // requirement for emoji channel
            return errorLog(`emoji-vote.js:2 checkEmojiRequests()\nNot enough permissions for the #${emojiRequestChannel.name} channel.\n[MANAGE_MESSAGES - MANAGE_EMOJIS - ADD_REACTIONS - READ_MESSAGE_HISTORY]`, undefined)
        else {
            emojiRequestChannel.messages.fetch({ limit: 30 })
                .then(messages => {
                    const staffApprovedEmoji = bot.guilds.cache.get(config.LaezariaServerID).emojis.cache.find(emoji => emoji.name.toLowerCase() === 'laezaria');
                    if (!staffApprovedEmoji) return errorLog(`emoji-vote.js:3 checkEmojiRequests() 'laezaria' reaction not found.`);
                    const emojiRequestMessages = messages.filter(m => m.author.bot === true && m.reactions.cache.get('✅') && m.reactions.cache.get('✅').count >= reactsAmount && m.reactions.cache.has(staffApprovedEmoji.id));

                    // procedure to loop emoji requests
                    const requestLoop = async allRequests => {
                        for (let i = 0; i < allRequests.size; i++) {
                            const t = 4000;
                            await new Promise(r => setTimeout(r, t, i));
                            const requestType = await allRequests.array()[i].content.split(" ")[1];
                            const emojiRequestMsg = await allRequests.array()[i];
                            // console.log(emojiRequestMsg, requestType);
                            await requestHandler(emojiRequestMsg, requestType);
                        }
                        return 'finished';
                    }
                    requestLoop(emojiRequestMessages)
                    // .then(x => console.log(`requestLoop: ${x}`));
                });
        }
    }
});