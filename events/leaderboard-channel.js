const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");
const fs = require('fs');
const cron = require('node-cron');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                LEADERBOARD CHANNEL HANDLER                               //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    // Update Leaderboard Messages - https://crontab.guru/examples.html
    cron.schedule('0 13 * * *', () => {
        // console.error('Updated Leaderboard Message:', currentUTCDate());
        updateCurrentLeaderboard();
        updateOverallLeaderboard();
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

    async function updateCurrentLeaderboard() {

        // Get the channel and fetch its last 20 messages
        const leaderboardFetch = await bot.guilds.cache.get(config.LaezariaServerID).channels.cache.get(config.Leaderboard_ChannelID).messages.fetch({ limit: 20 })
            .catch((error) => errorLog(`leaderboard-channel.js:1 updateLeaderboard()\nError to fetch the messages for the channel.`, error));

        // If leaderboardFetch is found
        if (leaderboardFetch) {

            // Find the leaderboard message object from the fetch
            const leaderboardMessage = await leaderboardFetch.find(msg => msg.id === config.Leaderboard_Message_CurrentID);
            if (leaderboardMessage && leaderboardMessage.author === bot.user) {

                // Load points_current.json file and parse it to javascript object
                const CurrentPointsJSON = fs.readFileSync("./points_current.json", "utf8");
                let currentLB = JSON.parse(CurrentPointsJSON);

                // Sort the points by its values (from the highest to lowest)
                currentLB.sort(function (a, b) {
                    return b.points - a.points;
                });

                // Create a string for the leaderboard message with top10 people
                let currentLeaderboardString = '';

                currentLB.map((user, index) => {
                    switch (Math.round(index + 1)) {
                        case 1: return currentLeaderboardString = currentLeaderboardString + `> :first_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 2: return currentLeaderboardString = currentLeaderboardString + `> :second_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 3: return currentLeaderboardString = currentLeaderboardString + `> :third_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 4: return currentLeaderboardString = currentLeaderboardString + `> \n> :four:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 5: return currentLeaderboardString = currentLeaderboardString + `> :five:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 6: return currentLeaderboardString = currentLeaderboardString + `> :six:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})}\n`
                        case 7: return currentLeaderboardString = currentLeaderboardString + `> :seven:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 8: return currentLeaderboardString = currentLeaderboardString + `> :eight:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 9: return currentLeaderboardString = currentLeaderboardString + `> :nine:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 10: return currentLeaderboardString = currentLeaderboardString + `> :keycap_ten:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})‎`
                        default: break;
                    }
                });

                // If Leaderboard ranking is empty
                if (!currentLeaderboardString) currentLeaderboardString = 'Donate something to be the 1st one!';

                // Update the leaderboardMessage with new data
                let loadingEmoji = leaderboardMessage.guild.emojis.cache.find(emoji => emoji.name === 'Loading');
                if (!loadingEmoji) loadingEmoji = '';

                // leaderboardMessage with 10 people on the leaderboard
                if (currentLB[9]) {
                    // Chose a fun fact info ID
                    const randomPersonFromLB = Math.floor(Math.random() * 10);
                    const totalPointsCurrent = Math.round(currentLB[0].points + currentLB[1].points + currentLB[2].points + currentLB[3].points + currentLB[4].points + currentLB[5].points + currentLB[6].points + currentLB[7].points + currentLB[8].points + currentLB[9].points);
                    const percentageCurrent = (currentLB[randomPersonFromLB].points / totalPointsCurrent) * 100;

                    leaderboardMessage.edit(`**Current Season Leaderboard!**\n${currentLeaderboardString}\n\nFull Leaderboard: <https://leaderboard.skillez.eu>\n ${loadingEmoji} Last update: ${currentUTCDate()}\n*Fun fact: Top10 has ${totalPointsCurrent.toLocaleString()} points in total, and ${currentLB[randomPersonFromLB].tag} contributed ~${percentageCurrent.toFixed(2)}% of these points!*\n ‎`, 'Leaderboard Update')
                        // .then(() => console.log(`Current Leaderboard message has been updated! ${leaderboardMessage.content.length}`))
                        .catch(error => errorLog(`leaderboard-channel.js:2 updateLeaderboard()\nError to edit the message!.`, error));
                } else {
                    // If leaderboard has less than 10 people
                    leaderboardMessage.edit(`**Current season leaderboard!**\n${currentLeaderboardString}\n\nFull Leaderboard: <https://leaderboard.skillez.eu>\n ${loadingEmoji} Last update: ${currentUTCDate()}\n ‎`, 'Leaderboard Update')
                        // .then(() => console.log(`Current Leaderboard message has been updated! ${leaderboardMessage.content.length}`))
                        .catch(error => errorLog(`leaderboard-channel.js:3 updateLeaderboard()\nError to edit the message!.`, error));
                }

            } else return errorLog(`leaderboard-channel.js:4 updateLeaderboard()\nLeaderboard channel is empty or missing READ_MESSAGE_HISTORY or incorrect 'Leaderboard_Message_CurrentID' in config file or defined message is not sent by the bot or message has been removed!`);
        }
    }

    async function updateOverallLeaderboard() {

        // Get the channel and fetch its last 20 messages
        const leaderboardFetch = await bot.guilds.cache.get(config.LaezariaServerID).channels.cache.get(config.Leaderboard_ChannelID).messages.fetch({ limit: 20 })
            .catch((error) => errorLog(`leaderboard-channel.js:1 updateOverallLeaderboard()\nError to fetch the messages for the channel.`, error));

        // If leaderboardFetch is found
        if (leaderboardFetch) {

            // Find the leaderboard message object from the fetch
            const leaderboardMessage = await leaderboardFetch.find(msg => msg.id === config.Leaderboard_Message_OverallID);
            if (leaderboardMessage && leaderboardMessage.author === bot.user) {

                // Load points_overall.json file and parse it to javascript object
                const OverallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
                let overallLB = JSON.parse(OverallPointsJSON);

                // Sort the points by its values (from the highest to lowest)
                overallLB.sort(function (a, b) {
                    return b.points - a.points;
                });

                // Create a string for the leaderboard message with top10 people
                let currentLeaderboardString = '';
                let top1emoji = leaderboardMessage.guild.emojis.cache.find(emoji => emoji.name === 'peepoIloveu');
                if (!top1emoji) top1emoji = '';

                overallLB.map((user, index) => {
                    switch (Math.round(index + 1)) {
                        case 1: return currentLeaderboardString = currentLeaderboardString + `> :first_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag}) ${top1emoji}\n`
                        case 2: return currentLeaderboardString = currentLeaderboardString + `> :second_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 3: return currentLeaderboardString = currentLeaderboardString + `> :third_place:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 4: return currentLeaderboardString = currentLeaderboardString + `> \n> :four:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 5: return currentLeaderboardString = currentLeaderboardString + `> :five:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 6: return currentLeaderboardString = currentLeaderboardString + `> :six:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})}\n`
                        case 7: return currentLeaderboardString = currentLeaderboardString + `> :seven:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 8: return currentLeaderboardString = currentLeaderboardString + `> :eight:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 9: return currentLeaderboardString = currentLeaderboardString + `> :nine:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})\n`
                        case 10: return currentLeaderboardString = currentLeaderboardString + `> :keycap_ten:    **${user.points.toLocaleString()}** points from <@${user.id}> (${user.tag})‎`
                        default: break;
                    }
                });

                // If Leaderboard ranking is empty
                if (!currentLeaderboardString) currentLeaderboardString = 'Donate something to be the 1st one!';

                // Edit the message with new update
                leaderboardMessage.edit(`**Overall Leaderboard!**\n${currentLeaderboardString}\n ‎`, 'Leaderboard Update')
                    // .then(() => console.log(`Overall Leaderboard message has been updated! ${leaderboardMessage.content.length}`))
                    .catch(error => errorLog(`leaderboard-channel.js:3 updateOverallLeaderboard()\nError to edit the message!.`, error));

            } else return errorLog(`leaderboard-channel.js:4 updateOverallLeaderboard()\nLeaderboard channel is empty or missing READ_MESSAGE_HISTORY or incorrect 'Leaderboard_Message_OverallID' in config file or defined message is not sent by the bot or message has been removed!`);
        }
    }
});