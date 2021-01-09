const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");
const fs = require('fs');
const cron = require('node-cron');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                LEADERBOARD CHANNEL HANDLER                               //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    // Update Leaderboard Messages - https://crontab.guru/examples.html
    cron.schedule('0 13 * * *', () => { // At 1pm daily.
        console.log('leaderboard-channel.js: Leaderboard message update:', currentUTCDate());
        updateLeaderboardMessage(config.leaderboard.message_CurrentID, 'points_current', 'Season 1');
        updateLeaderboardMessage(config.leaderboard.message_OverallID, 'points_overall', 'Overall', 'peepoIloveu');
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

        // const date = new Date(2000, 4, 13, 13, 0, 0, 0);
        const date = new Date();
        // return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
        return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${formatAMPM(date)} UTC`;
    }

    function totalPointsLeaderboard(leaderboardFile) {
        try {
            const fileContent = fs.readFileSync(`./points_system/${leaderboardFile}.json`, 'utf8');
            var leaderboardObject = JSON.parse(fileContent);
        } catch (error) {
            return 'ERROR';
        }

        // console.error(leaderboardObject);
        let totalPointsValue = 0;
        for (let index = 0; index < leaderboardObject.length; index++) {
            const element = leaderboardObject[index];
            // console.error(`index: ${index}`, element);
            totalPointsValue = totalPointsValue + element.points;
            // console.error(`index: ${index} - ${totalPointsValue}`);
        }
        return totalPointsValue;
    }

    async function updateLeaderboardMessage(messageID, leaderboardFile, leaderboardName, emojiName) {
        // Get the channel and fetch its last 20 messages
        const leaderboardFetch = await bot.guilds.cache.get(config.laezariaServerID).channels.cache.get(config.leaderboard.channelID).messages.fetch({ limit: 20 })
            .catch((error) => errorLog(`leaderboard-channel.js:1 updateLeaderboardMessage()\nError to fetch the messages for the channel.`, error));

        // If leaderboardFetch is found
        if (leaderboardFetch) {

            // Find the leaderboard message object from the fetch
            const leaderboardMessage = await leaderboardFetch.find(msg => msg.id === messageID);
            if (leaderboardMessage && leaderboardMessage.author === bot.user) {

                // Load leaderboardFile.json file and parse it to javascript object
                try {
                    const pointsJSONfile = fs.readFileSync(`./points_system/${leaderboardFile}.json`, "utf8");
                    var leaderboardObject = JSON.parse(pointsJSONfile);
                } catch (error) {
                    return errorLog(`leaderboard-channel.js:2 updateLeaderboardMessage()\nError to LOAD/PARSE ${leaderboardFile}.json for the ${leaderboardName} leaderboard.`, error);
                }

                // Sort the points by its values (from the highest to lowest)
                leaderboardObject.sort(function (a, b) {
                    return b.points - a.points;
                });

                // Create a string for the leaderboard message with top10 people
                let currentLeaderboardString = '';

                let top1Emoji = ` ${leaderboardMessage.guild.emojis.cache.find(emoji => emoji.name === emojiName)}`;
                if (top1Emoji === ' undefined') top1Emoji = '';

                leaderboardObject.map((user, index) => {
                    switch (Math.round(index + 1)) {
                        case 1: return currentLeaderboardString = currentLeaderboardString + `> :first_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})${top1Emoji}\n`;
                        case 2: return currentLeaderboardString = currentLeaderboardString + `> :second_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 3: return currentLeaderboardString = currentLeaderboardString + `> :third_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 4: return currentLeaderboardString = currentLeaderboardString + `> \n> :four:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 5: return currentLeaderboardString = currentLeaderboardString + `> :five:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 6: return currentLeaderboardString = currentLeaderboardString + `> :six:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})}\n`;
                        case 7: return currentLeaderboardString = currentLeaderboardString + `> :seven:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 8: return currentLeaderboardString = currentLeaderboardString + `> :eight:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 9: return currentLeaderboardString = currentLeaderboardString + `> :nine:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`;
                        case 10: return currentLeaderboardString = currentLeaderboardString + `> :keycap_ten:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})‎`;
                        default: break;
                    }
                });

                // If Leaderboard ranking is empty
                if (!currentLeaderboardString) currentLeaderboardString = 'Donate something to be the 1st one!';

                // Update the leaderboardMessage with new data
                let loadingEmoji = leaderboardMessage.guild.emojis.cache.find(emoji => emoji.name === 'Loading');
                if (!loadingEmoji) loadingEmoji = '';

                // leaderboardMessage with 10 people on the leaderboard
                if (leaderboardObject[9]) {
                    // Choose a fun fact info ID
                    const randomPersonFromLB = Math.floor(Math.random() * 10);
                    const percentageLB = (leaderboardObject[randomPersonFromLB].points / totalPointsLeaderboard(leaderboardFile)) * 100;

                    leaderboardMessage.edit(`**${leaderboardName} Leaderboard!**\n${currentLeaderboardString}\n\nFull Leaderboard: <https://leaderboard.skillez.eu>\n ${loadingEmoji} Last update: ${currentUTCDate()}\n*${leaderboardName} leaderboard has ${totalPointsLeaderboard(leaderboardFile).toLocaleString()} points in total, and ${leaderboardObject[randomPersonFromLB].tag} contributed ~${percentageLB.toFixed(2)}% of these points!*\n ‎`, 'Leaderboard Update')
                        // .then(() => console.log(`Current Leaderboard message has been updated! ${leaderboardMessage.content.length}`))
                        .catch(error => errorLog(`leaderboard-channel.js:3 updateLeaderboardMessage()\nError to edit the message!.`, error));
                } else {
                    // If leaderboard has less than 10 people
                    leaderboardMessage.edit(`**${leaderboardName} leaderboard!**\n${currentLeaderboardString}\n\nFull Leaderboard: <https://leaderboard.skillez.eu>\n ${loadingEmoji} Last update: ${currentUTCDate()}\n ‎`, 'Leaderboard Update')
                        // .then(() => console.log(`Current Leaderboard message has been updated! ${leaderboardMessage.content.length}`))
                        .catch(error => errorLog(`leaderboard-channel.js:4 updateLeaderboardMessage()\nError to edit the message!.`, error));
                }

            } else return errorLog(`leaderboard-channel.js:5 updateLeaderboardMessage()\nLeaderboard channel is empty or missing READ_MESSAGE_HISTORY or incorrect ${leaderboardFile} provided or defined message is not sent by the bot or message has been removed!`);
        }
    }
});