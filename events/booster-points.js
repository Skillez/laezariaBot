const { bot, Discord, errorLog, LaezariaIconURL, sendEmbedLog, embedColors } = require('../app');
const config = require("../bot-settings.json");
const cron = require('node-cron');
const fs = require('fs');
const weeklyPointsAmount = 300;

//////////////////////////////////////////////////////////////////////////////////////////////
//                          NITRO BOOSTER POINTS EVERY WEEK HANDLER                         //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    // Update Leaderboard Message - https://crontab.guru/examples.html
    cron.schedule('0 10 * * 4', () => { // At 10:00AM on Thursday.
        // console.error('booster-points.js - givePointsToServerBooster()', currentUTCDate());
        givePointsToServerBooster();
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

    function givePointsToServerBooster() {
        const getBoosterRole = bot.guilds.cache.get(config.LaezariaServerID).roles.cache.get(config.NitroRoleID);
        if (!getBoosterRole) return errorLog(`booster-points.js:1 givePointsToServerBooster() I can't find nitro booster role - 'config.NitroRoleID'`);

        // Create a string of user tags with space
        const nitroList = getBoosterRole.members.map(m => m.user.tag).join(" ");
        if (!nitroList) return console.log(`nitroList is empty`);
        let nitroListString = "Empty list";

        //Split the string into 1,000 chracters groups
        const nitroListParts = nitroList.match(/.{1,1000}/g)
        if (nitroListParts[1]) {
            nitroListString = `${nitroListParts[0]}... and more.`;
        }
        else nitroListString = nitroListParts[0];

        // procedure to loop weekly points for nitro users
        const pointsLoop = async nitroRoleMap => {
            for (let i = 0; i < nitroRoleMap.size; i++) {
                const t = 3000;
                await new Promise(r => setTimeout(r, t, i));
                const nitroGuildMember = await nitroRoleMap.array()[i];

                await addPointsToBoosterCurrentLB(nitroGuildMember.user, weeklyPointsAmount)
                // .then(console.log(`[CurrentLB] +${weeklyPointsAmount} points added to ${nitroGuildMember.user.tag}`));

                await addPointsToBoosterOverallLB(nitroGuildMember.user, weeklyPointsAmount)
                // .then(console.log(`[OveralLB] +${weeklyPointsAmount} points added to ${nitroGuildMember.user.tag}`));

                // console.log(`[Laezaria Points] +${weeklyPointsAmount} points added to ${nitroGuildMember.user.tag} for weekly server boost!`);
            }
            return 'finished';
        }

        pointsLoop(getBoosterRole.members)
            .then(x => {
                // console.log(`pointsLoop: ${x}`);

                // Send an embed message log
                const embed_confirmation_weekly_points = new Discord.MessageEmbed()
                    .setAuthor(`Laezaria Points System Log`, LaezariaIconURL)
                    .setDescription(`Server boosters received their weekly +${weeklyPointsAmount} laezaria points.\n‏‏‎ ‎`)
                    .addFields(
                        { name: 'Points Receiver List', value: `${nitroListString}`, inline: false })
                    .setColor(embedColors.PointsColor)
                    .setThumbnail(LaezariaIconURL)
                    .setFooter(currentUTCDate())
                    .setTimestamp()
                return sendEmbedLog(embed_confirmation_weekly_points, config.BotLog_ChannelID, 'Laezaria Bot Points - Logs');
            });
    }

    async function addPointsToBoosterCurrentLB(user, amount) {

        // Load points_current.json file and parse it to javascript object
        const currentPointsJSON = fs.readFileSync("./points_current.json", "utf8");
        var currentLB = await JSON.parse(currentPointsJSON);

        // User is not in the database
        if (!currentLB.find(u => u.id === user.id)) {
            newPoints = { "id": user.id, "tag": user.tag, "points": amount };

            // Add a new data in the database
            await currentLB.push(newPoints);

            // Write a new data to the database
            return fs.writeFile("./points_current.json", JSON.stringify(currentLB), (error) => {
                if (error) errorLog(`booster-points.js:1 addPointsToBoosterCurrentLB()\nError to write data to points_current.json!\nSet ${amount} points to a new ${user.id}(${user.tag}).`, error);

                // Send an embed message confirmation (new user)
                // console.log(`[currentLB] Laezaria Points System: added +${amount} to the ${user.tag}(new record) for boosting the server for a week!`);
            });
        }

        // User is already in the database
        if (currentLB.find(u => u.id === user.id)) {
            let addPoints = currentLB.find(u => u.id === user.id).points + amount;

            // Set a new values
            currentLB.find(u => u.id === user.id).points = addPoints;
            currentLB.find(u => u.id === user.id).tag = user.tag;

            // Write an update to the database
            return fs.writeFile("./points_current.json", JSON.stringify(currentLB), error => {
                if (error) errorLog(`booster-points.js:2 addPointsToBoosterCurrentLB()\nError to write data to points_current.json!\nSet ${addPoints} points to ${user.id}(${user.tag}).`, error);

                // Send an embed message confirmation (user update)
                // console.log(`[currentLB] Laezaria Points System: added +${amount} to the ${user.tag}(update) for boosting the server for a week!`);
            });
        }
    }

    async function addPointsToBoosterOverallLB(user, amount) {

        // Load points_overall.json file and parse it to javascript object
        const overallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
        var overallLB = await JSON.parse(overallPointsJSON);

        // User is not in the database
        if (!overallLB.find(u => u.id === user.id)) {
            newPoints = { "id": user.id, "tag": user.tag, "points": amount };

            // Add a new data in the database
            await overallLB.push(newPoints);

            // Write a new data to the database
            return fs.writeFile("./points_overall.json", JSON.stringify(overallLB), (error) => {
                if (error) errorLog(`booster-points.js:1 addPointsToBoosterOverallLB()\nError to write data to points_overall.json!\nSet ${amount} points to a new ${user.id}(${user.tag}).`, error);

                // Send an embed message confirmation (new user)
                // console.log(`[overallLB] Laezaria Points System: added +${amount} to the ${user.tag}(new record) for boosting the server for a week!`);
            });
        }

        // User is already in the database
        if (overallLB.find(u => u.id === user.id)) {
            let addPoints = overallLB.find(u => u.id === user.id).points + amount;

            // Set a new values
            overallLB.find(u => u.id === user.id).points = addPoints;
            overallLB.find(u => u.id === user.id).tag = user.tag;

            // Write an update to the database
            return fs.writeFile("./points_overall.json", JSON.stringify(overallLB), error => {
                if (error) errorLog(`booster-points.js:2 addPointsToBoosterOverallLB()\nError to write data to points_overall.json!\nSet ${addPoints} points to ${user.id}(${user.tag}).`, error);

                // Send an embed message confirmation (user update)
                // console.log(`[overallLB] Laezaria Points System: added +${amount} to the ${user.tag}(update) for boosting the server for a week!`);
            });
        }
    }
});