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
    cron.schedule('0 10 * * 4', () => { // At 10am on Thursday.
        console.log(`booster-points.js: +${weeklyPointsAmount} laezaria points to server nitro booster`, currentUTCDate());
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
        const getBoosterRole = bot.guilds.cache.get(config.laezariaServerID).roles.cache.get(config.roles.nitroRoleID);
        if (!getBoosterRole) return errorLog(`booster-points.js:1 givePointsToServerBooster() I can't find nitro booster role - 'config.roles.nitroRoleID'`);

        // Create a string of user tags
        const nitroList = getBoosterRole.members.map(m => m.user.tag).join(", ");
        if (!nitroList) return;

        let nitroListString = '';
        //Split the string into 1,000 chracters groups
        const nitroListParts = nitroList.match(/.{1,1000}/g);
        if (nitroListParts[1]) nitroListString = `${nitroListParts[0]}... and more.`;
        else nitroListString = nitroListParts[0];

        const pointsLooper = async ArrayWithTheRoleMembers => {
            ArrayWithTheRoleMembers.forEach(element => {
                addPointstoBoosterHandler(element.user, weeklyPointsAmount, 'current_season');
                addPointstoBoosterHandler(element.user, weeklyPointsAmount, 'overall_points');
            });
            return;
        }

        pointsLooper(getBoosterRole.members)
            .then(() => {
                // Find the leaz emoji
                let laezEmoji = bot.guilds.cache.get(config.laezariaServerID).emojis.cache.find(emoji => emoji.name === 'laezaria');
                if (!laezEmoji) laezEmoji = 'laezaria';
                // Send an embed message log
                const embed_confirmation_weekly_points = new Discord.MessageEmbed()
                    .setAuthor(`Laezaria Points System Log`, LaezariaIconURL)
                    .setDescription(`Server boosters received their weekly +${weeklyPointsAmount} ${laezEmoji} points.\n‏‏‎ ‎`)
                    .addFields(
                        { name: 'Points Receiver List', value: `${nitroListString}`, inline: false })
                    .setColor(embedColors.PointsColor)
                    .setThumbnail(LaezariaIconURL)
                    .setFooter(currentUTCDate())
                    .setTimestamp()
                return sendEmbedLog(embed_confirmation_weekly_points, config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            });

    }

    async function addPointstoBoosterHandler(user, amount, folder) {
        // Try to load the JSON file from the database folder
        try {
            fileContent = fs.readFileSync(`./points_system/${folder}/${user.id}.json`, 'utf8');
        } catch (error) {
            if (error.message.includes('ENOENT: no such file or directory, open')) {
                data = { "id": user.id, "tag": user.tag, "points": amount };
                return fs.writeFileSync(`./points_system/${folder}/${user.id}.json`, JSON.stringify(data, null, 2));
            }
            // console.error(`[${folder} add] ERROR to load ${user.tag} file: ${user.id}`, error);
            return errorLog(`booster-points.js:1 addPointstoBoosterHandler()\nError to LOAD ${user.tag} data file.`, error)
        }

        // File is found and loaded
        if (fileContent) {
            try {
                var userDataFile = JSON.parse(fileContent);
            } catch (error) {
                // console.error(`[${folder} add] ERROR: Can't parse ${user.tag} data file: ${user.id}`, error);
                return errorLog(`booster-points.js:1 addPointstoBoosterHandler()\nError to PARSE ${user.tag} data file.`, error);
            }

            if (userDataFile) {
                userDataFile.points = await userDataFile.points + amount;
                return fs.writeFileSync(`./points_system/${folder}/${user.id}.json`, JSON.stringify(userDataFile, null, 2));
            }
        }
    }

    function givePointsToServerBoosterOld() {
        const getBoosterRole = bot.guilds.cache.get(config.laezariaServerID).roles.cache.get(config.roles.nitroRoleID);
        if (!getBoosterRole) return errorLog(`booster-points.js:1 givePointsToServerBooster() I can't find nitro booster role - 'config.roles.nitroRoleID'`);

        // Create a string of user tags with space
        const nitroList = getBoosterRole.members.map(m => m.user.tag).join(" ");
        if (!nitroList) return console.log(`nitroList is empty`);
        let nitroListString = "Empty list";

        //Split the string into 1,000 chracters groups
        const nitroListParts = nitroList.match(/.{1,1000}/g)
        if (nitroListParts[1]) nitroListString = `${nitroListParts[0]}... and more.`;
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
                return sendEmbedLog(embed_confirmation_weekly_points, config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            });
    }
});